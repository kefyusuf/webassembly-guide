// Example 04 test — runs the Go/Wasm module via Node + wasm_exec_node.js.
// wasm_exec_node.js is Go's Node runner (copied from GOROOT); it sets up
// the syscall/js bridge. The program self-tests when running under Node.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

const output = execFileSync(
  process.execPath,
  [path.join(dir, "dist", "wasm_exec_node.js"), path.join(dir, "dist", "main.wasm")],
  { encoding: "utf8", timeout: 30_000 }
);

console.log(output.trim());
