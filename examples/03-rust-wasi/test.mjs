// Example 03 test — runs via Node's built-in WASI runtime (no installation).
// Node acts as the "host" here: it decides which folder and env vars to
// grant — the module cannot request permissions.
import { WASI } from "node:wasi";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const bytes = readFileSync(path.join(dir, "dist", "rust_wasi_example.wasm"));

const wasi = new WASI({
  version: "preview1",
  args: ["rust_wasi_example"],
  env: { WASI_USER: "alice" },
  preopens: { ".": dir }, // opens the "." folder to the module as "/" (a permission!)
});

const wasm = await WebAssembly.compile(bytes);
const instance = await WebAssembly.instantiate(wasm, wasi.getImportObject());

try {
  wasi.start(instance);
} catch (e) {
  console.error("Trap:", e);
}
