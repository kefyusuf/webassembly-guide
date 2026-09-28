// Example 18 test — TDD: run BEFORE building.
// JSPI (JavaScript Promise Integration): a *synchronous* wasm call site
// calls a promise-returning JS import; the wasm execution suspends and the
// main event loop stays alive. The call from JS returns a real Promise.
import assert from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..", "..");
const wasmPath = path.join(dir, "dist", "jspi.wasm");

assert.ok(existsSync(wasmPath), "dist/jspi.wasm missing — run ./build.sh first");
const wt = path.join(root, ".tools", process.platform === "win32" ? "wasm-tools.exe" : "wasm-tools");
assert.ok(existsSync(wt), "wasm-tools missing — run ./build.sh first");

// JSPI availability (Node 26+/Chrome 137+; older runtimes need a flag)
assert.ok(typeof WebAssembly.Suspending === "function", "JSPI unavailable: WebAssembly.Suspending missing");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The import: raw sync signature (i32)->i32, wrapped in Suspending so it
// may return a Promise. Wasm suspends while it resolves. The wrapper sleeps
// a fixed 200 ms per call — the wasm argument (10, 20) is the "result".
const getValue = new WebAssembly.Suspending(async (ms) => {
  await sleep(200);
  return ms;
});

const { instance } = await WebAssembly.instantiate(readFileSync(wasmPath), {
  env: { get_value: getValue },
});

// The magic: calling the sync export returns a Promise instead of blocking.
const run = WebAssembly.promising(instance.exports.run);
const maybePromise = run();
assert.ok(maybePromise instanceof Promise, "promising export must return a Promise");

// A *synchronous* wasm call that internally awaits two 200 ms JS promises
// cannot take 400 ms without JSPI suspension — this duration IS the proof
// that wasm paused inside its async imports.
const t0 = performance.now();
const result = await maybePromise;
const duration = performance.now() - t0;

assert.strictEqual(result, 30, `run() should sum 10 + 20, got ${result}`);
assert.ok(duration >= 380, `suspension did not happen: call took only ${duration.toFixed(0)} ms`);

console.log("Example 18 (JSPI) — all assertions passed ✓");
console.log(`  run() returned a Promise, resolved to ${result}`);
console.log(`  duration ${duration.toFixed(0)} ms — wasm was suspended inside both 200 ms async imports`);
