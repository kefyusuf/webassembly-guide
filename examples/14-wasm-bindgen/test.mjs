// Example 14 test — TDD: run BEFORE building.
// Verifies the wasm-bindgen glue: typed strings, floats and a Rust struct
// surfaced to JS as a real class — no pointers, no manual memory.
import assert from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const gluePath = path.join(dir, "dist", "wasm_bindgen_example.js");
const wasmPath = path.join(dir, "dist", "wasm_bindgen_example_bg.wasm");

assert.ok(existsSync(gluePath) && existsSync(wasmPath), "dist glue missing — run ./build.sh first");

// `--target web` glue fetches the .wasm via URL; Node's fetch can't do
// file://, so we pass the bytes directly to init().
const { default: init, greet, Counter, f2c } = await import(
  "file://" + gluePath.replace(/\\/g, "/")
);
await init({ module_or_path: readFileSync(wasmPath) });

// --- Strings: &str in, String out — no ptr/len gymnastics ---------------------
const g = greet("ZCode");
assert.ok(g.includes("Hello, ZCode!"), `greet mismatch: ${g}`);

// --- Floats --------------------------------------------------------------------
assert.strictEqual(f2c(98.6).toFixed(2), "37.00");

// --- Rust struct → JS class ------------------------------------------------------
const c = new Counter(41);
c.increment(1);
c.increment(10);
assert.strictEqual(c.value, 52, `counter value mismatch: ${c.value}`);
const finalValue = c.value;           // read before freeing
c.free(); // wasm-bindgen exposes explicit ownership; JS GC calls Rust drop

// After free(), the pointer is zeroed — accessing the object again must fail.
assert.throws(() => c.value, /null pointer/, "access after free must throw");

console.log("Example 14 (wasm-bindgen) — all assertions passed ✓");
console.log("  greet('ZCode') =", g);
console.log("  Counter(41).increment(1).increment(10).value =", finalValue, "(freed afterwards)");
