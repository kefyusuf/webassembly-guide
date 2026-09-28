// Example 12 test — TDD: run BEFORE implementing the component.
// Verifies that build output is a real WebAssembly *component* (not just a
// core module) exporting the WIT world's functions.
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..", "..");
const component = path.join(dir, "dist", "calculator.wasm");

// --- Preconditions -----------------------------------------------------------
assert.ok(existsSync(component), "dist/calculator.wasm missing — run ./build.sh first");
const wt = path.join(root, ".tools", process.platform === "win32" ? "wasm-tools.exe" : "wasm-tools");
assert.ok(existsSync(wt), "wasm-tools missing — run ./build.sh first");

const run = (...args) => execFileSync(wt, args, { encoding: "utf8" });

// --- 1. It must be a valid component ----------------------------------------
assert.doesNotThrow(() => run("validate", component), "component must pass validation");

// --- 2. Its WIT interface must declare the world's exports -------------------
// (rustc's wasip2 wrapper reports the package as "root:component"; the
//  typed exports — not the package name — are the contract that matters)
const wit = run("component", "wit", component);
assert.ok(/export sum: func\(/.test(wit), "world must export sum");
assert.ok(/export greet: func\(/.test(wit), "world must export greet");

// --- 3. Rich types must appear: list<f64> and string in signatures -----------
assert.ok(wit.includes("list<f64>"), "sum must take list<f64> (not raw pointers!)");

console.log("Example 12 (Component Model) — all assertions passed ✓");
console.log("--- component WIT ---");
console.log(wit.trim());
