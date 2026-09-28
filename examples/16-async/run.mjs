// Example 16 — async around a synchronous core.
//
// Wasm execution is synchronous: when you call an export on the main
// thread, the event loop is frozen until it returns. The standard answer
// today is to move the module to a worker (Worker in browsers,
// worker_threads in Node) and await a message — the UI/loop stays alive.
// (The *real* async future is WASI 0.3's native async — see the README for
// its 2026 status; this example is the pattern that works everywhere today.)
//
//   node run.mjs     → prints a JSON report (consumed by test.mjs)

import { Worker } from "node:worker_threads";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const dir = path.dirname(fileURLToPath(import.meta.url));
const wasmPath = path.resolve(dir, "..", "02-rust-web", "dist", "rust_web_example.wasm");
if (!existsSync(wasmPath)) {
  console.error("build example 02 first: cd ../02-rust-web && ./build.sh");
  process.exit(1);
}

const FIB_N = 45;
const ITERATIONS = 30_000_000; // enough work to freeze a loop measurably

// Heartbeat monitor: counts event-loop liveness during a window.
const heartbeats = { n: 0, timer: null, reset() { this.n = 0; clearInterval(this.timer); this.timer = setInterval(() => this.n++, 10); }, stop() { clearInterval(this.timer); } };

// --- The same wasm module, loaded twice: main thread + worker -----------------
const wasmBytes = readFileSync(wasmPath);

// 1) Synchronous call on the main thread — the loop MUST freeze.
const { instance } = await WebAssembly.instantiate(wasmBytes, {});
heartbeats.reset();
const t0 = performance.now();
let syncResult = 0;
for (let i = 0; i < ITERATIONS; i++) syncResult = instance.exports.fib(FIB_N);
const syncDuration = performance.now() - t0;
const syncHeartbeats = heartbeats.n;
heartbeats.stop();
await new Promise((r) => setTimeout(r, 30)); // let timers settle

// 2) Same workload in a worker — the loop MUST stay alive.
const workerSrc = `
const { parentPort } = require("node:worker_threads");
const { readFileSync } = require("node:fs");
parentPort.on("message", async ({ wasmPath, n, iterations }) => {
  const wasm = await WebAssembly.instantiate(readFileSync(wasmPath), {});
  const t0 = performance.now();
  let r = 0n;
  for (let i = 0; i < iterations; i++) r = wasm.instance.exports.fib(n);
  parentPort.postMessage({ result: r.toString(), durationMs: performance.now() - t0 });
});
`;
const worker = new Worker(workerSrc, { eval: true });
heartbeats.reset();
const t1 = performance.now();
const workerResult = await new Promise((resolve, reject) => {
  worker.once("message", (m) => resolve(BigInt(m.result)));
  worker.once("error", reject);
  worker.postMessage({ wasmPath, n: FIB_N, iterations: ITERATIONS });
});
const workerDuration = performance.now() - t1;
const workerHeartbeats = heartbeats.n;
heartbeats.stop();
await worker.terminate();

console.log(JSON.stringify({
  sync: { result: Number(syncResult), durationMs: syncDuration, heartbeats: syncHeartbeats },
  worker: { result: Number(workerResult), durationMs: workerDuration, heartbeats: workerHeartbeats },
}));
