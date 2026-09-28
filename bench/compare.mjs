// Cross-language benchmark — the same fib(algorithm) compiled by different
// toolchains, compared on binary size and execution speed.
//
//   node compare.mjs           # human-readable table
//   node compare.mjs --json    # machine-readable report (used by test.mjs)
//
// Requires the examples to be built (01, 02, 05 at minimum; 03/04/11 for sizes).
import { execFileSync } from "node:child_process";
import { readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const ex = (rel) => path.join(root, "..", "examples", rel);
const asJson = process.argv.includes("--json");

// --- 1. Make sure the WAT artifacts exist (example 01 compiles them) ---------
if (!existsSync(ex("01-wat-basics/04-loops.wasm"))) {
  execFileSync(process.execPath, ["run.mjs"], { cwd: ex("01-wat-basics"), stdio: "ignore" });
}

// --- 2. Load the modules -----------------------------------------------------
const load = (rel) =>
  WebAssembly.instantiate(readFileSync(ex(rel)), {}).then((r) => r.instance.exports);

const wat = await load("01-wat-basics/04-loops.wasm");    // fib(n: i64) -> i64
const rust = await load("02-rust-web/dist/rust_web_example.wasm"); // fib(n: u32) -> u64
const as = await load("05-assemblyscript/dist/index.wasm"); // fib(n: i32) -> i64

// --- 3. Correctness first: fib(40) = 102334155 on every toolchain -------------
const fib40 = {
  wat: wat.fib(40n),
  rust: rust.fib(40),
  assemblyscript: as.fib(40),
};
for (const [lang, v] of Object.entries(fib40)) {
  if (BigInt(v) !== 102334155n) throw new Error(`${lang}: wrong fib(40) = ${v}`);
}

// --- 4. Timing: warm up, then average N calls of fib(40) -----------------------
const time = (fn, iterations = 200) => {
  for (let i = 0; i < 20; i++) fn(); // warm-up (JIT)
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  return (performance.now() - t0) / iterations;
};

const timings = {
  wat: time(() => wat.fib(40n)),
  rust: time(() => rust.fib(40)),
  assemblyscript: time(() => as.fib(40)),
};

// --- 5. Binary sizes of every built artifact ------------------------------------
const sizeOf = (rel) => {
  const p = ex(rel);
  return existsSync(p) ? statSync(p).size : null;
};
const sizes = {};
for (const [lang, rel] of Object.entries({
  wat: "01-wat-basics/04-loops.wasm",
  rust: "02-rust-web/dist/rust_web_example.wasm",
  wasi: "03-rust-wasi/dist/rust_wasi_example.wasm",
  go: "04-go-wasm/dist/main.wasm",
  assemblyscript: "05-assemblyscript/dist/index.wasm",
  wasmgc: "11-wasmgc/dist/gc.wasm",
})) {
  const s = sizeOf(rel);
  if (s !== null) sizes[lang] = s;
}

// --- 6. Report --------------------------------------------------------------------
const report = {
  languages: Object.fromEntries(
    Object.keys(timings).map((lang) => [
      lang,
      { fib40: fib40[lang].toString(), avgMs: Number(timings[lang].toFixed(4)) },
    ])
  ),
  sizes, // bytes
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const fmt = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(1)} KB`);
  console.log("Cross-language fib(40) benchmark (200 calls, avg ms)");
  console.log("-".repeat(58));
  for (const [lang, row] of Object.entries(report.languages)) {
    console.log(`${lang.padEnd(16)} ${String(row.avgMs).padStart(8)} ms   fib40 = ${row.fib40}`);
  }
  console.log("-".repeat(58));
  console.log("Binary sizes:");
  for (const [lang, bytes] of Object.entries(report.sizes)) {
    console.log(`${lang.padEnd(16)} ${fmt(bytes).padStart(10)}   (${bytes} bytes)`);
  }
}
