// Example 02 test — runs the Rust-compiled module in Node.
// Build first:  ./build.sh   (or the cargo command in the README)
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const wasmPath = path.join(dir, "dist", "rust_web_example.wasm");

const { instance } = await WebAssembly.instantiate(readFileSync(wasmPath), {});
const e = instance.exports;

console.log("== Rust → Wasm (wasm32-unknown-unknown) ==");
console.log("add(19, 23) =", e.add(19, 23));
console.log("fib(50) =", e.fib(50));
console.log("f2c(98.6) =", e.f2c(98.6).toFixed(2));

// Read the static string: ptr + length from memory
const ptr = e.greet_ptr();
const len = e.greet_len();
const bytes = new Uint8Array(e.memory.buffer, ptr, len);
console.log("greeting =", new TextDecoder().decode(bytes));

// Zero-copy uppercase transformation
const message = "hello wasm";
const outBuf = new TextEncoder().encode(message);
const mem = new Uint8Array(e.memory.buffer);
mem.set(outBuf, 1024); // write to a free address
e.to_uppercase(1024, outBuf.length);
console.log("to_uppercase =", new TextDecoder().decode(mem.subarray(1024, 1024 + outBuf.length)));

// Array sum: write an i32 array to memory, let Wasm sum it
const numbers = Int32Array.from([10, -20, 30, 40, 50]);
new Int32Array(e.memory.buffer, 2048).set(numbers);
console.log("sum_array =", e.sum_array(2048, numbers.length));
