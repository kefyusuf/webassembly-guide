// Example 08 — the WebAssembly API in Node.js (zero dependencies)
// This script assembles its own minimal module FROM RAW BYTES: it shows how
// hand-writable a Wasm binary really is. (No compiler involved!)

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// 1. A hand-written minimal module: (func (export "add") (param i32 i32) (result i32))
// ---------------------------------------------------------------------------
// Sections: magic+version → type → func → export → code
const MINIMAL_WASM = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, // magic: "\0asm"
  0x01, 0x00, 0x00, 0x00, // version 1
  // Type section (id=1): one signature — (i32, i32) -> i32
  0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,
  // Function section (id=3): 1 function, using type index 0
  0x03, 0x02, 0x01, 0x00,
  // Export section (id=7): expose function 0 as "add"
  0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00,
  // Code section (id=10): local.get 0; local.get 1; i32.add; end
  0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b,
]);

console.log("== 1. WebAssembly.validate — are these bytes valid? ==");
console.log("validate(MINIMAL_WASM) =", WebAssembly.validate(MINIMAL_WASM));

console.log("\n== 2. Synchronous compile + instantiate ==");
const module = new WebAssembly.Module(MINIMAL_WASM);
const instance = new WebAssembly.Instance(module);
console.log("add(40, 2) =", instance.exports.add(40, 2));

console.log("\n== 3. Async API + imports (handing a JS function to Wasm) ==");
// A module that expects an import — the WAT equivalent:
//   (import "env" "log" (func $log (param i32)))
//   (func (export "log_it") (param i32) local.get 0; call $log)
// Hand-encoding that here would be long — we reuse 01-wat-basics.
const importPath = path.join(dir, "..", "01-wat-basics", "05-imports.wasm");
if (existsSync(importPath)) {
  const bytes = readFileSync(importPath);
  const { instance } = await WebAssembly.instantiate(bytes, {
    env: {
      log: (n) => console.log("  [wasm → JS import call]", n),
    },
  });
  instance.exports.log_it(321);
  instance.exports.log_to_five();
} else {
  console.log("  (01-wat-basics not compiled — skipped)");
}

console.log("\n== 4. WebAssembly.Memory — memory shared with JS ==");
const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 }); // 1 page = 64 KiB
const view = new Uint8Array(memory.buffer);
view[0] = 42;
console.log("memory.buffer size =", memory.buffer.byteLength, "bytes (1 page)");
console.log("after memory.grow(1) =", memory.grow(1) + 1, "pages total");

console.log("\n== 5. Error cases ==");
const broken = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x02, 0x00, 0x00, 0x00]); // invalid version
console.log("validate(broken) =", WebAssembly.validate(broken));
try {
  new WebAssembly.Module(broken);
} catch (e) {
  console.log("Module error:", e.name + ":", e.message.slice(0, 60) + "…");
}

console.log("\n== 6. Other modules in this repo (if built) ==");
const candidates = [
  ["02-rust-web/dist/rust_web_example.wasm", (e) => `add(19,23) = ${e.add(19, 23)}`],
  ["05-assemblyscript/dist/index.wasm", (e) => `add(6,7) = ${e.add(6, 7)}`],
];
for (const [rel, probe] of candidates) {
  const p = path.join(dir, "..", rel);
  if (existsSync(p)) {
    const { instance } = await WebAssembly.instantiate(readFileSync(p), {});
    console.log(`  ${rel}:`, probe(instance.exports));
  } else {
    console.log(`  ${rel}: not built (skipped)`);
  }
}
