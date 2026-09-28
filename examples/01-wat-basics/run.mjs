// Example 01 runner — Node.js (no installation beyond `npm install`)
// Compiles the .wat files (via the wabt npm package, or the wat2wasm CLI
// if available) and runs them with the WebAssembly API.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));

// --- WAT → WASM compilation -------------------------------------------------
async function compile(watFile) {
  const out = watFile.replace(/\.wat$/, ".wasm");
  if (existsSync(path.join(dir, out))) return out;

  try {
    // wabt on the system (wat2wasm)
    execFileSync("wat2wasm", [watFile, "-o", out], { cwd: dir });
    return out;
  } catch {
    // otherwise fall back to the npm wabt package
    try {
      const wabt = (await import("wabt")).default ?? (await import("wabt"));
      const initWabt = typeof wabt === "function" ? wabt : wabt.init?.bind(wabt);
      const modul = await initWabt();
      const wat = readFileSync(path.join(dir, watFile), "utf8");
      const result = modul.parseWat(watFile, wat);
      const { buffer } = result.toBinary({ log: false });
      writeFileSync(path.join(dir, out), Buffer.from(buffer));
      return out;
    } catch {
      console.error(`⚠ could not compile ${watFile}: wabt is required.`);
      console.error("  Install: winget install wabt  |  npm install");
      return null;
    }
  }
}

const load = async (name) => {
  const file = await compile(name);
  if (!file) return null;
  const bytes = readFileSync(path.join(dir, file));
  return WebAssembly.instantiate(bytes, {
    env: { log: (n) => console.log("  [wasm log]", n) },
  });
};

// --- Run ----------------------------------------------------------------------
console.log("== 01-hello ==");
const m1 = await load("01-hello.wat");
if (m1) {
  console.log("  hello() =", m1.instance.exports.hello());
  console.log("  hello_plus_2() =", m1.instance.exports.hello_plus_2());
}

console.log("\n== 02-arithmetic ==");
const m2 = await load("02-arithmetic.wat");
if (m2) {
  const e = m2.instance.exports;
  console.log("  compute(6, 7) =", e.compute(6, 7), "(expected 26)");
  console.log("  f2c(100) =", e.f2c(100).toFixed(1), "(expected 37.8)");
  console.log("  abs64(-9223372036854775) =", e.abs64(-9223372036854775n));
}

console.log("\n== 03-memory ==");
const m3 = await load("03-memory.wat");
if (m3) {
  const e = m3.instance.exports;
  console.log("  i32_read(0) =", e.i32_read(0), "(from the data section: 42)");
  e.i32_write(64, 1337);
  console.log("  i32_read(64) =", e.i32_read(64), "(wrote 1337, read it back)");
  // JS can reach the same memory through a DataView:
  const mem = new DataView(e.memory.buffer);
  console.log("  JS DataView i32_read(64) =", mem.getInt32(64, true));
}

console.log("\n== 04-loops ==");
const m4 = await load("04-loops.wat");
if (m4) {
  const e = m4.instance.exports;
  console.log("  fib(10) =", e.fib(10n), "(expected 55)");
  console.log("  fib(50) =", e.fib(50n), "(expected 12586269025)");
  console.log("  sum(100) =", e.sum(100), "(expected 5050)");
}

console.log("\n== 05-imports ==");
const m5 = await load("05-imports.wat");
if (m5) {
  const e = m5.instance.exports;
  e.log_it(99);
  e.log_to_five();
}

console.log("\nDone.");
