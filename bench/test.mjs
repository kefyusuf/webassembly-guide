// Benchmark test — TDD: run BEFORE implementing compare.mjs.
// Verifies the cross-language fib benchmark produces a consistent,
// correct comparison table.
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const out = execFileSync(process.execPath, [path.join(root, "bench", "compare.mjs"), "--json"], {
  encoding: "utf8",
  cwd: root,
  timeout: 120_000,
});
const report = JSON.parse(out);

// The same algorithm must be benchmarked on at least WAT, Rust and
// AssemblyScript — three independent toolchains.
for (const lang of ["wat", "rust", "assemblyscript"]) {
  const row = report.languages[lang];
  assert.ok(row, `benchmark result missing for ${lang}`);
  assert.strictEqual(
    BigInt(row.fib40),
    102334155n,
    `${lang} fib(40) must equal 102334155 (got ${row.fib40})`
  );
  assert.ok(row.avgMs > 0 && Number.isFinite(row.avgMs), `${lang} timing must be positive`);
}

// Binary sizes must be reported for every built artifact, including Go.
assert.ok(Object.keys(report.sizes).length >= 4, "sizes must cover the built artifacts");
assert.ok(report.sizes.go > 1_000_000, "Go runtime output should be MB-scale");

console.log("Benchmark — all assertions passed ✓");
