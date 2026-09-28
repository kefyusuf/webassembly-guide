# 1. What Is WebAssembly?

## Definition

**WebAssembly (Wasm)** is a portable **binary instruction format** that runs in modern browsers and in runtime environments outside the browser. It is not a programming language — it is a **compilation target**: languages like C, C++, Rust and Go, which normally compile to machine code, can alternatively compile to Wasm.

Wasm code runs **sandboxed (isolated)** at **near-native speed**. It is standardized by the W3C, and all major browser vendors (Chrome, Firefox, Safari, Edge) — and their companies (Google, Microsoft, Mozilla, Apple) — work together in the standards consortium.

```
Source language (C, Rust, Go, …)
        │  compiler (rustc, clang, gc, …)
        ▼
.wasm  —  portable binary module
        │  runtime (browser, wasmtime, wasmer, …)
        ▼
Just-in-time compilation (JIT/AOT) → CPU instructions
```

## History

| Year | Milestone |
|---|---|
| 2013 | asm.js: Mozilla's attempt at "near-native speed" via a strictly typable subset of JS (Emscripten output) |
| 2015 | The WebAssembly community group is founded; the name is first announced |
| 2017 | First browsers (Chrome, Firefox) ship Wasm enabled by default; the MVP feature set freezes |
| 2019 | **Wasm 1.0** becomes an official W3C Recommendation |
| 2022 | WasmGC, threads, SIMD and other major features land in browsers incrementally |
| 2025 | **WebAssembly 3.0** becomes a W3C standard: GC, 64-bit memory, multi-memory, portable SIMD and more standardized in one release |
| 2026 | WASI 0.3 (native async I/O + networking) matures the server side; the Component Model reaches production use |

## Why was it needed? (The problem: the JS performance wall)

JavaScript is a dynamic language, and JIT compilers are massively engineered — but dynamic-language semantics (type uncertainty, garbage collection pauses, cases that fall back to interpretation) hit a ceiling for certain workloads:

- 3D games and engines (Unity, Unreal)
- Video/audio editing (porting native codecs to the web)
- CAD and vector graphics applications
- Scientific computing, physics simulation
- Porting existing C/C++ codebases to the web without rewriting

The first attempt was **asm.js**: a statically-typable subset of JS + ahead-of-time compilation. It worked, but because the format was still JS, parsing costs, portability, and language design were limited. Wasm is the same idea redesigned at the right level of abstraction: **a compact binary format + static types + a brand-new virtual machine in the browser**.

## The design goals

The WebAssembly specification defines four goals:

1. **Speed** — near-native execution via JIT/AOT compilation.
2. **Safety** — sandboxed, memory-safe, capability-based execution; code can only touch resources explicitly handed to it.
3. **Language independence** — many languages, from C to Python, can target it.
4. **Platform independence** — the same `.wasm` file runs on desktop, mobile, ARM/x86, browser/server alike.

## Wasm ≠ a replacement for JavaScript

This is the most common misconception. Wasm deliberately **cannot access the DOM directly**; it cannot call any Web API on its own. Every browser interaction (DOM, canvas, network, localStorage…) goes through JavaScript "glue" code:

```
Wasm module  ⇄  JS glue  ⇄  Web APIs (DOM, fetch, …)
```

The design is deliberate: Wasm stays small and simple, the security model stays crisp, and full compatibility with the JS ecosystem is preserved. The rule of thumb:

- **UI, event handling, DOM manipulation** → JavaScript
- **Heavy computation, algorithms, existing libraries, game engine cores** → Wasm

## "Web" is in the name, but it's not web-only

The name was a historical accident; today most of Wasm's growth is **outside the browser**. Thanks to [WASI](06-ecosystem.md) (WebAssembly System Interface), Wasm modules can access system resources — files, clock, network — through a standard interface. That makes Wasm a good fit for:

- Serverless functions / edge computing
- Plugin architectures (database extensions, proxy filters)
- A container alternative (secure, tiny)
- IoT and embedded systems

Details: [06 — Ecosystem](06-ecosystem.md) and [05 — Industry usage](05-industry-usage.md).
