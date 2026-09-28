# Example 03 — Rust → WASI (Outside the Browser)

The same Rust code, compiled this time to the **wasm32-wasip1** target: instead of a browser, it runs inside a **runtime** (wasmtime, Node, Wasmer) and accesses files, the clock and environment variables.

## Requirement

```bash
rustup target add wasm32-wasip1
```

## Build and run

```bash
./build.sh

# With Node (no installation needed)
node test.mjs

# or with a real runtime:
wasmtime run --env WASI_USER=alice --dir=. dist/rust_wasi_example.wasm
```

## What you learn

1. **The `_start` convention** — WASI modules use a `_start` export to become a command-line program, like C's `main`.
2. **Permissions live in the runner, not the code** — the same module:
   - `wasmtime run program.wasm` → no file access, `WASI_USER` invisible
   - `wasmtime run --dir=. --env WASI_USER=alice program.wasm` → has access
3. **Even `println!` is an import** — Rust std translates stdout writes into the `fd_write` WASI function; the runtime connects it to a real terminal.
4. **Node's embedded WASI** — `node:wasi` makes your Node process a host with zero installation.

## Expected output

```
--- Environment variables ---
WASI_USER = alice

--- Clock ---
Unix time: 1790... seconds

--- File system ---
wasi-demo.txt written
wasi-demo.txt read back: Written from inside Wasm! 🚀

WASI program finished.
```

## The modern path: wasip2 and the Component Model

As of 2026 the modern form of the target is **wasm32-wasip2**, defined with WIT interfaces and packaged with the [Component Model](../../docs/en/06-ecosystem.md#component-model):

```bash
rustup target add wasm32-wasip2
cargo build --release --target wasm32-wasip2
# the output is already a component (when the preview2 SDK is used)
```

This example uses wasip1 because it is the more widely supported target — good for teaching the concepts.
