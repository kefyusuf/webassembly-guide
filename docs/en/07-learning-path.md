# 7. Learning Path

## Stage 0 — Prerequisites

- Basic JavaScript (browser path) or basic systems knowledge (server path)
- Fundamentals of at least one compiled language (C, C++, Rust, Go…)

## Stage 1 — Concepts (1 week)

1. Read [01 — What is Wasm](01-what-is-wasm.md) and [02 — How it works](02-how-it-works.md).
2. Inspect a `.wasm` file in browser DevTools: open any Wasm-powered site → Sources/Debugger panel → the `.wasm` section.
3. Run [examples/08-node-demo](../../examples/08-node-demo/): see the `WebAssembly` API with zero setup.

## Stage 2 — Go deep with WAT (1 week)

4. [examples/01-wat-basics](../../examples/01-wat-basics/) — write WAT by hand, compile with `wat2wasm`, read it back with `wasm2wat`.
5. Do it alongside MDN's [text format guide](https://developer.mozilla.org/docs/WebAssembly/Understanding_the_text_format).

## Stage 3 — Wire up your first language (1–2 weeks)

6. **The Rust path (recommended):** [examples/02-rust-web](../../examples/02-rust-web/) — pointer/length string exchange, in-place memory processing.
7. **The Go path:** [examples/04-go-wasm](../../examples/04-go-wasm/).
8. **If you're a JS team:** [examples/05-assemblyscript](../../examples/05-assemblyscript/).

## Stage 4 — Outside the browser (2 weeks)

9. [examples/03-rust-wasi](../../examples/03-rust-wasi/) — files, clock, environment variables.
10. Install wasmtime (`cargo install wasmtime-cli` or via a [package manager](https://docs.wasmtime.dev/)) and run the same module outside the browser.
11. Read the [Component Model section](06-ecosystem.md#component-model) of the ecosystem doc; optionally build a component with `wasm-tools`.

## Stage 5 — A real project (a month)

Options:
- An in-browser **image filter/editor** (Rust + canvas) — try SIMD.
- A **serverless API** (Rust + Spin/Fermyon, or a wasmtime-based service).
- **Port an existing C library** to the web (Emscripten) — the most instructive exercise.

## Skill levels

| Level | You can… |
|---|---|
| Beginner | Read WAT, load a module in the browser, call exports |
| Intermediate | Compile from a language, manage memory, benchmark performance |
| Advanced | Build language-agnostic systems with the Component Model, design host functions |
| Expert | Compiler backend / runtime optimization, contribute to WASI specifications |

## Common mistakes

1. **Writing the UI in Wasm** — bridge overhead can make it slower than JS.
2. **Calling across the bridge inside loops** — thousands of tiny calls instead of one big batched call.
3. **Copying data back and forth** — use `Memory.buffer` as a shared view; avoid unnecessary copies.
4. **Choosing a toolchain without measuring size** — Go/Blazor output can be heavy on mobile.
5. **Shipping to production without a debugging strategy** — plan `console.error`, wasm-bindgen panic hooks, and source maps.
