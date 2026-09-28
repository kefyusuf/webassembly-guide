# WebAssembly (Wasm) — A Comprehensive Learning Repository

> What WebAssembly is, how it works, which languages can target it, its strengths and weaknesses, and how the industry actually uses it — in English documentation with **working examples in many languages**.

🌍 **Dil / Language:** [English](README.md) · [Türkçe](README.tr.md)

▶ **Live demo (no setup):** [kefyusuf.github.io/webassembly-guide/07-web-demo](https://kefyusuf.github.io/webassembly-guide/07-web-demo/) — Rust/Go/AssemblyScript modules running in your browser

[![CI](https://github.com/kefyusuf/webassembly-guide/actions/workflows/ci.yml/badge.svg)](https://github.com/kefyusuf/webassembly-guide/actions/workflows/ci.yml)
![Depth](https://img.shields.io/badge/depth-beginner%E2%86%92advanced-blue)
![Languages](https://img.shields.io/badge/langs-WAT%20%7C%20Rust%20%7C%20Go%20%7C%20C%2FC%2B%2B%20%7C%20AssemblyScript%20%7C%20Python%20%7C%20C%23-green)

---

## 📚 Documentation

| Document | Topic |
|---|---|
| [docs/en/01-what-is-wasm.md](docs/en/01-what-is-wasm.md) | What WebAssembly is, its history, design goals, relationship with JS |
| [docs/en/02-how-it-works.md](docs/en/02-how-it-works.md) | Binary format, stack machine, WAT syntax, the JS bridge, memory model |
| [docs/en/03-languages-and-tools.md](docs/en/03-languages-and-tools.md) | Which languages compile to Wasm, and how to choose |
| [docs/en/04-pros-and-cons.md](docs/en/04-pros-and-cons.md) | Advantages, disadvantages, when **not** to use it |
| [docs/en/05-industry-usage.md](docs/en/05-industry-usage.md) | Industry adoption: Figma, Photoshop, AutoCAD, gaming, cloud, blockchain, edge… |
| [docs/en/06-ecosystem.md](docs/en/06-ecosystem.md) | WASI, Wasm 3.0, Component Model, runtimes, tooling |
| [docs/en/07-learning-path.md](docs/en/07-learning-path.md) | Step-by-step learning path + resources |

> Türkçe dokümantasyon için [docs/tr/](docs/tr/) klasörüne bakın.

## 🧪 Examples

| # | Folder | Language | What it teaches |
|---|---|---|---|
| 01 | [examples/01-wat-basics](examples/01-wat-basics/) | WAT (text format) | Hand-written modules — Wasm down to the metal |
| 02 | [examples/02-rust-web](examples/02-rust-web/) | Rust | Browser target, raw JS↔Rust memory/data exchange |
| 03 | [examples/03-rust-wasi](examples/03-rust-wasi/) | Rust | Outside-the-browser target (WASI) — files, clock, env vars |
| 04 | [examples/04-go-wasm](examples/04-go-wasm/) | Go | `GOOS=js GOARCH=wasm`, direct DOM access |
| 05 | [examples/05-assemblyscript](examples/05-assemblyscript/) | AssemblyScript | TypeScript-like syntax compiled to Wasm |
| 06 | [examples/06-c-emscripten](examples/06-c-emscripten/) | C | Emscripten — porting existing C code to the web |
| 07 | [examples/07-web-demo](examples/07-web-demo/) | HTML/JS | One browser page running all the modules |
| 08 | [examples/08-node-demo](examples/08-node-demo/) | Node.js | The raw `WebAssembly` API, zero dependencies |
| 09 | [examples/09-python-wasm](examples/09-python-wasm/) | Python | Both directions: Python **host** (wasmtime-py) and Python **inside** Wasm (Pyodide) |
| 10 | [examples/10-csharp-blazor](examples/10-csharp-blazor/) | C# | Blazor WebAssembly and Native AOT + WASI |
| 11 | [examples/11-wasmgc](examples/11-wasmgc/) | WAT (GC proposal) | WasmGC — GC'd structs/arrays living in the host garbage collector |
| 12 | [examples/12-component-model](examples/12-component-model/) | Rust + WIT | The Component Model — a real wasm32-wasip2 component from WIT interfaces |
| 13 | [examples/13-simd](examples/13-simd/) | WAT (SIMD) | Scalar vs `v128` sum — a measured 2.7× speedup |
| 14 | [examples/14-wasm-bindgen](examples/14-wasm-bindgen/) | Rust | "Production Rust" — wasm-bindgen: typed strings, structs as JS classes, ownership |
| 15 | [examples/15-threads](examples/15-threads/) | Rust (wasi-threads) | Real threads in the sandbox — atomics verified to 100,000 |
| 16 | [examples/16-async](examples/16-async/) | Rust + Node workers | Async around a synchronous core + verified WASI 0.3 async status |
| 17 | [examples/17-wasm-pack](examples/17-wasm-pack/) | Rust → npm | wasm-pack: the full npm package lifecycle, verified without publishing |
| 18 | [examples/18-jspi](examples/18-jspi/) | WAT + JSPI | Synchronous wasm that awaits JS promises ([live demo](https://kefyusuf.github.io/webassembly-guide/18-jspi/)) |

Every example was built and verified (06 ships with source + test; compiling it requires the Emscripten SDK, which wasn't available on the authoring machine). A cross-language benchmark lives in [bench/](bench/).

| Language | fib(40) avg | Binary size |
|---|---|---|
| WAT (hand-written) | 0.0001 ms | **134 bytes** |
| AssemblyScript | 0.0001 ms | 222 bytes |
| Rust | 0.0001 ms | 15.0 KB |
| Rust + WASI | — | 58.9 KB |
| WasmGC (WAT) | — | 408 bytes |
| Go (official) | — | 2.4 MB |

*Speed is identical once compiled — size is where toolchains differ. Details in [bench/](bench/).*

---

## ⚡ 60-Second Summary

**WebAssembly (Wasm)** is a portable **binary instruction format** that languages like C, C++, Rust, and Go can compile to. It runs alongside JavaScript in the browser at near-native speed — and increasingly **outside** the browser, in servers, edge functions, and IoT, as a secure "virtual machine".

- **It is not** a JavaScript replacement; it works *with* JS (Wasm cannot touch the DOM directly — every UI interaction crosses a JS bridge).
- **Why does it exist?** Born to bring high-performance code to the web; now carried into cloud/edge with a "compile once, run anywhere (safely and fast)" promise.
- **Who uses it?** Figma, Google Earth, Photoshop for Web, AutoCAD, Unity, Cloudflare Workers, Fastly, Shopify Functions, Ethereum/Polkadot clients, and many more.
- **Standard status (2026):** [WebAssembly 3.0](https://www.w3.org/2025/09/pressrelease-wasm-rec.html.tr) became a W3C standard in 2025 (GC, SIMD, memory64 and more); WASI 0.3 landed with native async I/O, maturing the server side.

---

## 🧩 Wasm's Three Personalities

1. **The browser's speed lane:** heavy computation, game engines, image/video processing, CAD, in-browser compilers (e.g. a Rust compiler running in your tab).
2. **A plugin/extension VM:** the secure extension mechanism of host apps (Envoy, SQLite, Shopify…).
3. **A cloud/edge deployment unit:** serverless functions with ~zero cold start and microsecond-granularity isolation (Cloudflare Workers, Fastly Compute, wasmCloud, Spin).

---

## 🚀 Quick Start

Start with zero setup (Node.js only):

```bash
git clone <repo-url> wasm-repo && cd wasm-repo

# Node demo: raw WebAssembly API, no toolchain needed
cd examples/08-node-demo && node run.mjs

# No toolchain at all? Run the WASI example in Docker (module + wasmtime, ~25 MB):
docker run --rm -v "$PWD":/data ghcr.io/kefyusuf/webassembly-guide
```

Per-example requirements are listed in [examples/README.md](examples/README.md). In short:

- **Rust:** `rustup target add wasm32-unknown-unknown wasm32-wasip1`
- **Go:** Go 1.21+ (nothing else)
- **AssemblyScript:** `npm install` (inside the example folder)
- **C:** Emscripten SDK
- **Python:** `pip install wasmtime` (optional)

---

## 🗺️ Suggested Reading Order

1. This README (overview)
2. [01 — What is Wasm](docs/en/01-what-is-wasm.md) → concepts
3. [02 — How it works](docs/en/02-how-it-works.md) → technical depth
4. [04 — Pros and cons](docs/en/04-pros-and-cons.md) → decision framework
5. Examples (01 → 10 in order)
6. [05 — Industry usage](docs/en/05-industry-usage.md) and [06 — Ecosystem](docs/en/06-ecosystem.md)

---

## 📄 License

MIT — see [LICENSE](LICENSE).
