// Verifies the Blazor WebAssembly publish bundle for example 10: the static
// host page, the .NET runtime compiled to Wasm, and the app's own C#
// assembly arriving as a hashed .wasm module (the .NET 10 output layout).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "dist");
const fw = join(dist, "_framework");

let failed = 0;
const check = (ok, good, bad) => {
  console.log(`  ${ok ? "✓" : "✗"} ${ok ? good : bad}`);
  if (!ok) failed++;
};

// 1. The static host page mounts the root component
const indexPath = join(dist, "index.html");
const index = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
check(index.includes('id="app"'),
  "index.html mounts the #app root component",
  "index.html missing or has no #app mount point");

// 2. The boot script that downloads and starts the .NET runtime
check(existsSync(join(fw, "blazor.webassembly.js")),
  "blazor.webassembly.js boot script present",
  "_framework/blazor.webassembly.js missing");

// 3. The .NET runtime itself ships as a real WebAssembly module
const nativeWasm = existsSync(fw)
  ? readdirSync(fw).find((f) => /^dotnet\.native\.[a-z0-9]+\.wasm$/.test(f))
  : undefined;
check(!!nativeWasm,
  `.NET runtime shipped as Wasm (${nativeWasm})`,
  "dotnet.native.*.wasm missing");
const magic = nativeWasm
  ? readFileSync(join(fw, nativeWasm)).subarray(0, 4).toString("latin1")
  : "";
check(magic === "\0asm",
  `${nativeWasm} starts with the Wasm magic bytes (\\0asm)`,
  `${nativeWasm} is not a Wasm module (magic=${JSON.stringify(magic)})`);

// 4. The app's own C# assembly is compiled to a hashed .wasm module too
const appWasm = existsSync(fw)
  ? readdirSync(fw).find((f) => /^BlazorExample\.[a-z0-9]+\.wasm$/.test(f))
  : undefined;
check(!!appWasm,
  `app C# assembly shipped as Wasm (${appWasm})`,
  "BlazorExample.*.wasm missing — the C# assembly did not compile to Wasm");

console.log(failed === 0
  ? "Example 10 (Blazor WebAssembly) — all assertions passed ✓"
  : `Example 10 (Blazor WebAssembly) — ${failed} assertion(s) failed ✗`);
if (failed > 0) process.exit(1);
