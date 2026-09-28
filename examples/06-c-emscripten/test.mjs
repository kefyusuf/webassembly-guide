// Example 06 test — runs the Emscripten output in Node.
// Build first: ./build.sh  (requires the Emscripten SDK)
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const jsPath = path.join(dir, "dist", "c_module.js");

if (!existsSync(jsPath)) {
  console.error("Build first: ./build.sh (requires the Emscripten SDK)");
  process.exit(1);
}

// The factory function produced with MODULARIZE=1
const createModule = new Function(
  `${readFileSync(jsPath, "utf8")}; return createModule;`
)();

const module = await createModule();

console.log("== C → Wasm (Emscripten) ==");
console.log("add(6, 7) =", module._add(6, 7));
console.log("fib(50) =", module._fib(50)); // BigInt return

// Read the string from the heap
const ptr = module._greet();
console.log("greet =", module.UTF8ToString(ptr));

// Zero-copy: JS Uint8Array → C doubles it → read back
const data = Uint8Array.from([10, 200, 255, 100]);
const memPtr = module._malloc(data.length);
new Uint8Array(module.HEAPU8.buffer, memPtr, data.length).set(data);
module._double_values(memPtr, data.length);
const result = new Uint8Array(module.HEAPU8.buffer, memPtr, data.length);
console.log("double_values([10,200,255,100]) =", Array.from(result), "(expected [20,255,255,200])");
module._free(memPtr);
