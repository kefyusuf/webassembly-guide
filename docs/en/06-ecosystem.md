# 6. Ecosystem: WASI, Wasm 3.0, the Component Model, and Runtimes

## WebAssembly 3.0 (W3C standard, 2025)

Headline features standardized in a single release:

- **WasmGC** — struct/array types + browser GC integration (enables the Java, Kotlin, Dart targets).
- **64-bit memory (memory64)** — beyond 4 GiB.
- **Multi-memory** — a module may use several linear memories.
- **Portable SIMD (fixed-width)** — `v128` instructions; 4–8× speedups in media/crypto workloads (this repo's memory-bound sum measures 2.7× — see [examples/13-simd](../../examples/13-simd/)).
- **Relaxed SIMD** — exploiting hardware variation.
- **Tail call** — important for compilers.
- **Exception handling** — carrying language exceptions at the Wasm level.
- **Reference types + typed function references** — more efficient bridges.
- **Multiple results** — functions may return several values.

## WASI (WebAssembly System Interface)

Outside the browser, WASI defines **standard, capability-based** access to system resources. Think "the Wasm version of POSIX", except permissions are explicitly granted:

```
wasmtime run --dir=./data program.wasm     # access only to ./data
wasmtime run program.wasm                  # no file access at all
```

- **WASI 0.2** (2024) — built on the Component Model; sockets, preview-level networking.
- **WASI 0.3** (2025–2026) — **native async I/O** (async/await instructions) and a preview network stack; a major maturity step for production server-side use.

## Component Model

Raw Wasm modules speak only numeric types: no strings, objects, or interfaces. The **Component Model** adds an interface layer on top:

- Interface definitions via **WIT** (WebAssembly Interface Types) — an IDL, similar in spirit to protobuf:

```wit
package demo:calculator;

world calculator {
  export sum: func(values: list<f64>) -> f64;
}
```

- Components written in **different languages can call each other** through a shared interface (a Rust component can call a Python component).
- The vision: "npm for Wasm" — a language-independent, secure package ecosystem.

```bash
# component build flow (Rust example)
cargo build --target wasm32-wasip2          # core module
wasm-tools component new module.wasm -o component.wasm
```

## Runtimes

| Runtime | Backed by | Highlights |
|---|---|---|
| **wasmtime** | Bytecode Alliance (Mozilla, Fastly, Intel…) | Cranelift JIT; security-focused; the most common reference runtime; .NET/Python/C bindings |
| **Wasmer** | Wasmer Inc. | Multiple backends (LLVM/Cranelift/Singlepass); WASIX; all platforms |
| **WasmEdge** | CNCF | Embedded/IoT and cloud focus, Kubernetes integrations |
| **V8** | Google | Browsers + Node.js + Cloudflare Workers |
| **JavaScriptCore** | Apple | Safari |
| **SpiderMonkey** | Mozilla | Firefox |

Node.js itself runs Wasm via V8 — no extra installation needed (see [examples/08-node-demo](../../examples/08-node-demo/)).

## Tooling

| Tool | What it does |
|---|---|
| `wasm-pack` | Rust→web packaging (produces an npm package) |
| `wasm-bindgen` | High-level Rust↔JS bridge |
| `wasm-tools` | Component Model toolset |
| WABT (`wat2wasm`, `wasm2wat`, `wasm-objdump`) | Low-level inspection/conversion |
| `wasm-opt` (Binaryen) | Optimization + size reduction |
| `wasm-decompile` | Back-translates Wasm to pseudo-C (helps understanding) |
| Emscripten SDK (`emcc`) | C/C++ SDK |
| `wasmprinter`, `wasm-gc` | Inspection and size trimming |

## Frameworks and platforms

- **Browser frameworks:** React/Vue/Svelte can consume Wasm normally; on the Rust side **Leptos**, **Yew**, **Dioxus** experiment with full-Wasm UI frameworks (UI without handing over to JS; still maturing).
- **wasmCloud, Spin, Fermyon Cloud** — Wasm-native application platforms.
- **runwasi** — running Wasm pods in Kubernetes (a containerd shim).
- **Extism** — adding a plugin system to any language (host in any language, plugins in any language).

## Learning resources

- [webassembly.org](https://webassembly.org/) — official site and roadmap
- [MDN WebAssembly](https://developer.mozilla.org/docs/WebAssembly) — the best API reference
- [WASI](https://wasi.dev/) — specifications
- [Component Model book](https://component-model.bytecodealliance.org/)
- [Wasmtime book](https://docs.wasmtime.dev/)
- [MDN: Understanding WebAssembly text format](https://developer.mozilla.org/docs/WebAssembly/Understanding_the_text_format)
- [Awesome Wasm](https://github.com/mbasso/awesome-wasm) — an extensive link list
- [WABT](https://github.com/WebAssembly/wabt) — text↔binary tools
