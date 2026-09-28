// Example 11 test — TDD: run BEFORE implementing gc.wat.
// Verifies that a hand-written WasmGC module exposes real garbage-collected
// structs/arrays to JS as opaque objects — no linear memory involved.
import assert from "node:assert";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const wasmPath = path.join(dir, "dist", "gc.wasm");

// --- Preconditions -----------------------------------------------------------
assert.ok(existsSync(wasmPath), "dist/gc.wasm missing — run ./build.sh first");

const { instance } = await WebAssembly.instantiate(readFileSync(wasmPath), {});
const e = instance.exports;

// The module must NOT export linear memory: data lives in the GC heap.
assert.ok(!("memory" in e), "module should not export linear memory (WasmGC demo)");

// --- Structs ------------------------------------------------------------------
const p = e.new_point(3, 4);
assert.ok(typeof p === "object" && p !== null, "WasmGC struct reaches JS as an opaque object");
assert.strictEqual(e.get_x(p), 3, "struct.get reads field x");
assert.strictEqual(e.get_y(p), 4, "struct.get reads field y");

e.set_x(p, 100);
assert.strictEqual(e.get_x(p), 100, "struct.set mutates a mutable field");

// --- Arrays ---------------------------------------------------------------------
const buf = e.new_buffer(5, 10);
assert.strictEqual(e.buffer_len(buf), 5, "array.len reports length");
assert.strictEqual(e.buffer_get(buf, 2), 10, "array.get returns the init value");

e.buffer_set(buf, 2, 50);
assert.strictEqual(e.buffer_get(buf, 2), 50, "array.set mutates an element");

assert.strictEqual(e.buffer_sum(buf), 4 * 10 + 50, "buffer_sum computes 10+10+50+10+10 = 90");

console.log("Example 11 (WasmGC) — all assertions passed ✓");
