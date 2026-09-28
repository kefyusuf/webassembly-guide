# 3. Which Languages Compile to Wasm?

Almost every language has a Wasm target; what differs is **maturity**, **runtime size**, and **portability**. Below are the most common languages, toolchains, and a selection guide.

## First-class (most mature) languages

| Language | Toolchain | Targets | Strength | Caveat |
|---|---|---|---|---|
| **C / C++** | Emscripten (clang) | web, wasi | The gold standard for porting existing codebases to the web | Output size, JS glue complexity |
| **Rust** | `rustc` + `wasm-bindgen` / `wasm-pack` | web (unknown-unknown), wasi | Memory safety, excellent tooling, small output; the community default | Learning curve |
| **Go** | Official compiler (`GOOS=js GOARCH=wasm`) or **TinyGo** | web, wasi | Standard library, easy onboarding; TinyGo cuts output by ~90% | Official target ships a ~1–2 MB runtime (GC); TinyGo limits some libraries |
| **AssemblyScript** | Its own compiler (`npx as`) | web | TypeScript-like syntax; lowest barrier for JS developers | Community project; the language is shaped by Wasm's constraints |

## Managed languages arriving via WasmGC

Wasm 3.0's **GC (WasmGC)** feature enables targets that use the browser's garbage collector instead of shipping their own — smaller binaries and natural object sharing with the browser:

| Language | Status |
|---|---|
| **Java/Kotlin** | Kotlin/Wasm and GraalVM Wasm targets on the way to production; Google prototyped Java+WasmGC computation in Google Sheets |
| **Dart/Flutter** | Flutter Web's new compilation target (instead of JS) |
| **OCaml** | GC target in active development |

## Other notable languages

- **C# / .NET** — two paths: (1) **Blazor WebAssembly** (a full .NET runtime in the browser), (2) Native AOT with the `wasi-wasm` target. Also supported in the **wasmCloud** component ecosystem.
- **Python** — **Pyodide** (CPython compiled to Wasm, including NumPy and Pandas) runs Python in the browser. Server-side, CPython 3.13+ has an official WASI target. Python code is not *compiled* to Wasm; it is *interpreted inside* a compiled CPython (see the box below).
- **JavaScript/TypeScript** — JS itself can compile to Wasm (J2CL, `ts2wasm`, mostly experimental), but this is not a typical scenario.
- **Zig** — first-class support via `zig build-exe -target wasm32-freestanding`; a modern alternative to C.
- **Swift** — official WASI/WebAssembly target since Swift 6.
- **Kotlin** — Kotlin/Wasm (the web target of Kotlin Multiplatform).
- **Ruby, PHP, Lua, Forth…** — community targets/runtimes exist.

> ⚠️ **Interpreted languages — an important distinction.** For Python, Ruby, PHP and friends, two different things exist: (1) the language's *runtime* is compiled to Wasm and interprets your source code inside it (that's Pyodide), and (2) the language compiling *directly* to Wasm instructions (rare or limited for most interpreted languages). The interpretation layer largely negates Wasm's speed advantage — the value is "the language now runs in the browser", not performance.

## Which language should you pick? (Decision guide)

```
Porting existing C/C++ code?                     → Emscripten
Best developer experience + memory safety?       → Rust  (the default for most new projects)
Team already knows Go?                           → Go (TinyGo for small output)
JS/TS team making their first Wasm experiment?   → AssemblyScript
Full .NET ecosystem in the browser?              → Blazor WebAssembly
Python-based scientific work in the browser?     → Pyodide
Isolated modules on servers/edge?                → Rust + wasmtime (common), Go + Wasm, C# + wasmCloud
```

## Size comparison (measured)

The table below shows **real numbers** from this repository's [bench/](../../bench/) — the same iterative `fib` built by each toolchain (Rust's 15 KB includes its panic/formatting machinery; a `no_std` build shrinks to ~1 KB):

| Language / toolchain | Measured size | Notes |
|---|---|---|
| Hand-written WAT | 134 bytes | loops example (example 01) |
| AssemblyScript | 222 bytes | release build (example 05) |
| Rust (wasm32-unknown-unknown) | 15 KB | std + panics included (example 02) |
| Rust + WASI (wasip1) | 59 KB | std's WASI shims included (example 03) |
| WasmGC (WAT structs/arrays) | 408 bytes | example 11 |
| Go (official target) | 2.4 MB | full GC'd runtime ships along (example 04) |
| Blazor WebAssembly | ~5–10 MB | first load; reduced by AOT + trimming (not benchmarked here) |
| Pyodide | ~7–10 MB | core; libraries extra (not benchmarked here) |

This table is a **first-load cost** indicator, not a quality measure. In server/edge scenarios size matters even more. Note that *execution speed* of the same simple algorithm was identical across toolchains — differences appear in startup, instantiation, and vectorizable workloads, not in compiled loop speed.

## Toolchain glossary

- **wasm-pack / wasm-bindgen** — Rust's high-level web bridge; turns structs into JS classes, automates string/object exchange.
- **Emscripten** — SDK for C/C++; `emcc` compiler + POSIX-like libraries + HTML generation.
- **WABT** — low-level tools: `wat2wasm`, `wasm2wat`, `wasm-objdump`.
- **Binaryen** — optimizer/post-processor (`wasm-opt`); nearly every toolchain shrinks its output with it.
- **wasm-tools** — the Rust ecosystem's Component Model toolset (`wasm-tools component new` …).
