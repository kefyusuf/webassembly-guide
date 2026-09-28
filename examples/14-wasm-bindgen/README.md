# Example 14 — wasm-bindgen: "Production Rust"

Example 02 showed the raw pointer/length dance. This is how real projects ship Rust to the web: **wasm-bindgen** generates the glue, and typed values cross the boundary as first-class citizens.

| Raw (example 02) | wasm-bindgen (this example) |
|---|---|
| `greet_ptr()` / `greet_len()` + `TextDecoder` | `greet("name") → string` |
| manual `Int32Array` writes | `Counter` as a real JS class |
| no ownership story | `free()` — Rust drop, JS-side assertion |

## Build and test

```bash
./build.sh        # installs wasm-bindgen-cli on first run (~2–4 min), then builds
node test.mjs
```

## What you learn

1. **`#[wasm_bindgen]`** — one attribute replaces `#[no_mangle] pub extern "C"` *and* generates JS glue (`--target web` emits an ES module).
2. **Typed strings both ways** — `&str` in, `String` out; the pointer/length plumbing is generated.
3. **Structs as JS classes** — `Counter` gets a constructor, methods, and a getter (`#[wasm_bindgen(getter)]`); JS holds an owning reference.
4. **Ownership crosses the boundary** — the test proves `free()` zeroes the pointer: accessing afterwards throws `null pointer passed to rust`. Rust's drop runs; use-after-free becomes a loud, immediate error instead of silent corruption.
5. **Version discipline** — the `wasm-bindgen` crate and `wasm-bindgen-cli` versions must match *exactly* (build.sh checks).

## Pair with wasm-pack

`wasm-pack build --target web` wraps this whole flow (build + glue + a `pkg/` npm package with a package.json) in one command — ideal once you publish to npm.
