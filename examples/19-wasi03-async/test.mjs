// Verifies example 19: wasmtime runs the WASI 0.3 command component whose
// `run()` is a native async function. Each eprintln is followed by a
// canonical task.yield — the host suspends and resumes the guest task
// cooperatively (no threads). The test asserts every yield line arrived and
// the final count matches, i.e. the async task was driven to completion.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// Same pinned wasmtime build.sh installs (v49.0.1 — WASI 0.3 needs 46+)
const wtName = process.platform === "win32" ? "wasmtime-v49.0.1.exe" : "wasmtime-v49.0.1";
const wt = path.join(here, "..", "..", ".tools", wtName);

let failed = 0;
const check = (ok, good, bad) => {
  console.log(`  ${ok ? "✓" : "✗"} ${ok ? good : bad}`);
  if (!ok) failed++;
};

const wasm = path.join(here, "dist", "wasi03_async.wasm");
check(existsSync(wasm), "component artifact present", "dist/wasi03_async.wasm missing — run bash build.sh first");
check(existsSync(wt), `pinned wasmtime present (${wtName})`, "pinned wasmtime missing — run bash build.sh first");

if (existsSync(wasm) && existsSync(wt)) {
  // The guest logs to stderr (eprintln) — capture both streams.
  const res = spawnSync(wt, ["run", wasm], { encoding: "utf8" });
  check(res.status === 0, "wasmtime exited 0", `wasmtime exited ${res.status}`);
  const out = `${res.stdout}${res.stderr}`;
  const lines = out.trim().split(/\r?\n/);

  const yields = lines.filter((l) => /^yield \d+: suspending task/.test(l)).length;
  check(yields === 5,
    `5 yield lines observed (task suspended and resumed 5 times)`,
    `expected 5 yield lines, got ${yields}`);

  check(lines.some((l) => l.includes("completed=5")),
    "async run() drove to completion: completed=5",
    "async task did not reach completion — no completed=5 line");

  check(out.includes("completed=5") && yields === 5,
    "host awaited the async task end-to-end (canonical task system, no threads)",
    "host did not drive the async task correctly");
}

console.log(failed === 0
  ? "Example 19 (WASI 0.3 async) — all assertions passed ✓"
  : `Example 19 (WASI 0.3 async) — ${failed} assertion(s) failed ✗`);
if (failed > 0) process.exit(1);
