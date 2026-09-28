// Example 05 test — runs the AssemblyScript module in Node.
// Numeric exports need no loader; for sumArray we write to memory
// directly (the AssemblyScript memory layout is well-known).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const { instance } = await WebAssembly.instantiate(
  readFileSync(path.join(dir, "dist", "index.wasm")),
  {} // no imports in this example
);
const e = instance.exports;

console.log("== AssemblyScript → Wasm ==");
console.log("add(6, 7) =", e.add(6, 7));
console.log("fib(30) =", e.fib(30));
console.log("fib(50) =", e.fib(50));
console.log("f2c(100) =", e.f2c(100).toFixed(1));

// Write an i32 array to memory and let Wasm sum it — grow by one page first
const numbers = Int32Array.from([10, -20, 30, 40, 50]);
const { memory } = e;
const oldPages = memory.grow(1); // returns the page count before growing
const target = oldPages * 65536; // first byte address of the new page
new Int32Array(memory.buffer).set(numbers, target >> 2);
console.log("sumArray =", e.sumArray(target, numbers.length));
