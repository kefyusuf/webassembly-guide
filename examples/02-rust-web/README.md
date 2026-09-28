# Example 02 — Rust → WebAssembly (Browser Target)

Compiles Rust to the **wasm32-unknown-unknown** target and demonstrates talking to JS at the lowest level (pointer + length).

## Requirement

```bash
rustup target add wasm32-unknown-unknown
```

## Build and test

```bash
./build.sh        # or: cargo build --release --target wasm32-unknown-unknown
node test.mjs     # run in Node
```

To try it in the browser, see [07-web-demo](../07-web-demo/).

## What you learn

1. **`#[no_mangle] pub extern "C"`** — the signature of exported functions.
2. **Numbers are free** — `i32/f64` parameters and returns cross the JS↔Wasm boundary directly.
3. **Strings don't** — to show JS a string living in Rust memory: return a pointer + length, and let JS read `memory.buffer` with `TextDecoder`.
4. **Zero-copy processing** — `to_uppercase` and `sum_array`: JS writes to memory, Wasm processes in place, JS reads back. The core pattern of high-performance Wasm.

## Export summary of `lib.rs`

| Export | Signature | What it teaches |
|---|---|---|
| `add` | `(i32, i32) → i32` | Basic call |
| `fib` | `(u32) → u64` | Loop performance |
| `f2c` | `(f64) → f64` | Floating point |
| `greet_ptr` / `greet_len` | `() → ptr/len` | A string's memory address |
| `to_uppercase` | `(ptr, len)` | In-place memory processing |
| `sum_array` | `(ptr, len) → i64` | Sharing a numeric array |

## In real projects: wasm-bindgen + wasm-pack

This example builds the bridge by hand for teaching purposes. In production you'd use [`wasm-bindgen`](https://rustwasm.github.io/docs/wasm-bindgen/): it turns structs into JS classes and automates string/Promise exchange. [`wasm-pack build`](https://rustwasm.github.io/docs/wasm-pack/) goes further and produces an **npm package**:

```bash
wasm-pack build --target web        # emits an npm package into dist/
```

The same code with wasm-bindgen would look like:

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {name}!")   // strings are serialized automatically
}
```

## Size note

With `opt-level = "s"` + `lto` + `strip`, this module is ~1–2 KB of code (the file you see is ~15 KB including Rust's panic/format machinery). For further size optimization, run `wasm-opt -Os` (Binaryen).
