// Example 13 test — TDD: run BEFORE implementing simd.wat.
// Verifies a hand-written SIMD module computes the same sum as the scalar
// version, really uses v128 instructions, and (informationally) how much
// faster the vectorized path is.
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..", "..");
const wasmPath = path.join(dir, "dist", "simd.wasm");

// --- Preconditions -----------------------------------------------------------
assert.ok(existsSync(wasmPath), "dist/simd.wasm missing — run ./build.sh first");
const wt = path.join(root, ".tools", process.platform === "win32" ? "wasm-tools.exe" : "wasm-tools");
assert.ok(existsSync(wt), "wasm-tools missing — run ./build.sh first");

const { instance } = await WebAssembly.instantiate(readFileSync(wasmPath), {});
const e = instance.exports;

// --- Correctness: scalar and SIMD must agree exactly --------------------------
const N = 1 << 20; // 1,048,576 elements — multiple of 4, as required
assert.ok(N % 4 === 0, "test length must be a multiple of 4 (SIMD processes 4 lanes)");

const pages = Math.ceil((N * 4) / 65536);
e.memory.grow(pages - e.memory.buffer.byteLength / 65536);
const data = new Int32Array(e.memory.buffer);
for (let i = 0; i < N; i++) data[i] = i % 1000; // keep values small, no overflow
const expected = BigInt(data.reduce((a, b) => a + b, 0));

assert.strictEqual(e.sum_scalar(0, N), expected, "scalar sum must match JS reference");
assert.strictEqual(e.sum_simd(0, N), expected, "SIMD sum must match JS reference");

// --- Proof of SIMD: the disassembly must contain v128 instructions ------------
const wat = execFileSync(wt, ["print", wasmPath], { encoding: "utf8" });
assert.ok(wat.includes("v128.load"), "module must contain v128.load");
assert.ok(wat.includes("i64x2.extend_low_i32x4_s"), "module must contain the lane-widening SIMD instructions");

// --- Timing (informational, not asserted — CI VMs are noisy) -------------------
const time = (fn, iterations = 20) => {
  for (let i = 0; i < 5; i++) fn();
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return (performance.now() - t0) / iterations;
};
const scalarMs = time(() => e.sum_scalar(0, N));
const simdMs = time(() => e.sum_simd(0, N));

console.log("Example 13 (SIMD) — all assertions passed ✓");
console.log(`  scalar: ${scalarMs.toFixed(3)} ms/call   simd: ${simdMs.toFixed(3)} ms/call`);
console.log(`  speedup: ${(scalarMs / simdMs).toFixed(2)}x  (informational — noisy on shared CI VMs)`);
