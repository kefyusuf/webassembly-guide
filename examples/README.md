# Examples

Each folder has its own README. The numbers suggest a reading order.

| # | Folder | Language / Target | Requirement | Verified? |
|---|---|---|---|---|
| 01 | [01-wat-basics](01-wat-basics/) | WAT (text format) | WABT **or** `npm install` (wabt package) | ✅ tested in Node |
| 02 | [02-rust-web](02-rust-web/) | Rust → `wasm32-unknown-unknown` | `rustup target add wasm32-unknown-unknown` | ✅ tested in Node (~15 KB) |
| 03 | [03-rust-wasi](03-rust-wasi/) | Rust → `wasm32-wasip1` (WASI) | `rustup target add wasm32-wasip1` | ✅ tested via Node WASI |
| 04 | [04-go-wasm](04-go-wasm/) | Go → `GOOS=js GOARCH=wasm` | Go 1.21+ | ✅ tested in Node (~2.5 MB) |
| 05 | [05-assemblyscript](05-assemblyscript/) | AssemblyScript | `npm install` | ✅ tested in Node |
| 06 | [06-c-emscripten](06-c-emscripten/) | C → Emscripten | Emscripten SDK | source + test ready; compiling needs the SDK |
| 07 | [07-web-demo](07-web-demo/) | Browser (all together) | examples 02, 04, 05 built | static page; open with `python -m http.server` |
| 08 | [08-node-demo](08-node-demo/) | Node WebAssembly API | Node.js (nothing else) | ✅ tested |
| 09 | [09-python-wasm](09-python-wasm/) | Python (wasmtime-py + Pyodide) | `pip install wasmtime` | ✅ tested with wasmtime-py |
| 10 | [10-csharp-blazor](10-csharp-blazor/) | C# (Blazor / Native AOT WASI) | .NET SDK | command guide; projects come from `dotnet new` |
| 11 | [11-wasmgc](11-wasmgc/) | WAT (GC proposal) → wasm-tools | none (script downloads wasm-tools) | ✅ tested in Node |
| 12 | [12-component-model](12-component-model/) | Rust + WIT → wasm32-wasip2 component | `rustup target add wasm32-wasip2`; wasm-tools (auto-downloaded) | ✅ tested (component validated, WIT inspected) |
| 13 | [13-simd](13-simd/) | WAT (SIMD) → wasm-tools | none (script downloads wasm-tools) | ✅ tested in Node (scalar vs v128, 2.7× measured) |
| 14 | [14-wasm-bindgen](14-wasm-bindgen/) | Rust → wasm-bindgen 0.2.129 | rustup + cargo (CLI auto-installed) | ✅ tested in Node (strings, class, ownership) |
| 15 | [15-threads](15-threads/) | Rust → wasm32-wasip1-threads | rustup; pinned wasmtime v25 (auto-downloaded) | ✅ tested via wasmtime (100,000 atomic increments) |
| 16 | [16-async](16-async/) | Node worker_threads + example 02 module | Node.js; example 02 built | ✅ tested (freeze/no-freeze measured) |

## General notes

- **Build outputs (`dist/`, `target/`) are gitignored** — each example regenerates them with its own build command.
- On Windows run `bash build.sh` from Git Bash (the repo was authored and tested with Git Bash).
- The Node tests exercise the JS↔Wasm bridge without a browser; see example 07 for the browser demo.
