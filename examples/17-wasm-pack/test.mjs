// Example 17 test — TDD: run BEFORE building.
// Verifies the full npm package lifecycle WITHOUT touching the public
// registry:  wasm-pack build → npm pack (tarball) → npm install (local
// tarball) → import by package name from a consumer project.
import assert from "node:assert";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.join(dir, "pkg");

// --- Preconditions -----------------------------------------------------------
assert.ok(existsSync(path.join(pkgDir, "wasm_pack_example_bg.wasm")), "pkg/ missing — run ./build.sh first");
assert.ok(existsSync(path.join(pkgDir, "package.json")), "pkg/package.json missing — wasm-pack should generate it");

const consumer = path.join(dir, "consumer");
rmSync(consumer, { recursive: true, force: true });
mkdirSync(consumer, { recursive: true });
writeFileSync(path.join(consumer, "package.json"), JSON.stringify({ name: "consumer", type: "module", private: true }, null, 2));

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
// Windows: npm is a .cmd — Node requires shell:true to spawn it safely.
const npmOpts = { cwd: consumer, stdio: "ignore", shell: process.platform === "win32" };

// --- 1. npm pack: the pkg/ folder becomes a real npm tarball ------------------
execFileSync(npm, ["pack", "../pkg", "--pack-destination", "."], npmOpts);
const tgz = "wasm-pack-example-0.1.0.tgz";
assert.ok(existsSync(path.join(consumer, tgz)), "tarball missing after npm pack");

// --- 2. npm install from the local tarball (what `npm publish` + install feels like)
execFileSync(npm, ["install", "--no-save", "--no-fund", "--no-audit", `./${tgz}`], npmOpts);

// --- 3. The consumer imports BY PACKAGE NAME, like any npm dependency --------
const consumerSrc = `
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import init, { fib, Stack } from "wasm-pack-example";
const req = createRequire(import.meta.url);
// In Node, feed the wasm bytes directly — Node's fetch can't do file://.
await init({ module_or_path: readFileSync(req.resolve("wasm-pack-example/wasm_pack_example_bg.wasm")) });

assert(fib(30) === 832040n, "fib");
const s = new Stack();
// i64 values cross the boundary as BigInt:
s.push(10n); s.push(20n);
assert(s.peek() === 20n && s.pop() === 20n && s.peek() === 10n, "stack");
console.log(JSON.stringify({ fib: fib(30).toString(), ok: true }));
`;
writeFileSync(path.join(consumer, "consumer.mjs"),
  'import assert from "node:assert";\n' + consumerSrc);
const out = execFileSync(process.execPath, ["consumer.mjs"], { cwd: consumer, encoding: "utf8" });
const report = JSON.parse(out.split("\n").filter((l) => l.startsWith("{"))[0]);

assert.strictEqual(report.ok, true);
assert.strictEqual(report.fib, "832040");

console.log("Example 17 (wasm-pack) — all assertions passed ✓");
console.log("  npm pack → install → import by name: full lifecycle OK");
console.log("  fib(30) =", report.fib, "| Stack push/pop/peek OK");
