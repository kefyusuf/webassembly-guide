// Example 15 test — TDD: run BEFORE building.
// Verifies a wasi-threads module: N worker threads each increment a shared
// atomic M times; the final count must be exactly N×M (no lost updates),
// proving real parallel shared-memory execution inside the Wasm sandbox.
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..", "..");
const wasmPath = path.join(dir, "dist", "threads_example.wasm");

assert.ok(existsSync(wasmPath), "dist/threads_example.wasm missing — run ./build.sh first");
const wt = path.join(root, ".tools", process.platform === "win32" ? "wasmtime-v25.0.0.exe" : "wasmtime-v25.0.0");
assert.ok(existsSync(wt), "pinned wasmtime v25 missing — run ./build.sh first");

// -W threads enables the wasm threads proposal; -S threads provides the
// WASI threading imports (shared env.memory + thread-spawn).
const out = execFileSync(
  wt,
  ["run", "-W", "threads=y", "-S", "threads=y", wasmPath],
  { encoding: "utf8", timeout: 60_000 }
);

// THREADS=4, INCREMENTS=25_000 in main.rs → exactly 100_000.
assert.match(out, /final count = 100000/, `expected final count 100000, got:\n${out}`);
assert.match(out, /spawned 4 threads/, out);
console.log("Example 15 (threads) — all assertions passed ✓");
console.log(out.trim());
