// Example 16 test — TDD: run BEFORE implementing run.mjs.
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = execFileSync(process.execPath, [path.join(dir, "run.mjs")], {
  encoding: "utf8",
  timeout: 120_000,
});
const report = JSON.parse(out);

// The synchronous call must have blocked the main thread (no heartbeats
// during the window); the worker call must not (heartbeats keep flowing).
assert.ok(report.sync.result === 1134903170, "fib(45) result wrong (sync)");
assert.ok(report.sync.heartbeats <= 3, `sync path blocked the loop but leaked heartbeats: ${report.sync.heartbeats}`);
assert.ok(report.worker.result === 1134903170, "fib(45) result wrong (worker)");
assert.ok(report.worker.heartbeats >= 10, `worker path should not block the loop: ${report.worker.heartbeats}`);

console.log("Example 16 (async) — all assertions passed ✓");
console.log(`  sync  : ${report.sync.durationMs.toFixed(0)} ms, ${report.sync.heartbeats} heartbeats during call (loop frozen)`);
console.log(`  worker: ${report.worker.durationMs.toFixed(0)} ms, ${report.worker.heartbeats} heartbeats during call (loop alive)`);
