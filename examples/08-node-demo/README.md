# Example 08 — The WebAssembly API in Node.js (No Setup)

Node.js is an embedded Wasm runtime thanks to V8 — nothing to install. This example walks the core surface of the `WebAssembly` API:

- `WebAssembly.Module` / `Instance` / `Memory` / `Table` classes
- `validate()` for verification
- `instantiate` vs `instantiateStreaming`
- The import/export mechanism (handing a JS function to Wasm)
- Error cases (traps, link errors)

## Run

```bash
node run.mjs
```

It works even if no other example is built — the script assembles its own minimal module **from raw bytes**. If other examples are built, it loads and compares them too.

## Where you'd use this API in real life

- Loading Wasm modules distributed as npm packages (`@sqlite.org/sqlite-wasm`, `onnxruntime-web`…)
- Wiring your own Rust/C++ package into Node
- Using Node as a plugin sandbox (simple scale; for serious isolation use wasmtime)
