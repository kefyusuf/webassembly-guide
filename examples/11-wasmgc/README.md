# Example 11 — WasmGC: Garbage-Collected Structs and Arrays (Raw WAT)

**WasmGC** is the headline feature of WebAssembly 3.0 (W3C standard, 2025): struct and array types whose data lives in the **embedder's garbage collector** (the browser's or Node's GC). Languages with their own GC (Java, Kotlin, Dart, Python…) can now target Wasm *without shipping their own collector* — smaller binaries, natural object sharing with the host.

This example hand-writes GC types in WAT — no language toolchain needed.

## Build and test

```bash
./build.sh       # downloads wasm-tools once (~/.cache stays in <repo>/.tools)
node test.mjs
```

## What you learn

1. **`(type $point (struct …))` / `(type $buffer (array (mut i32)))`** — GC types in WAT.
2. **`struct.new` / `struct.get` / `struct.set`, `array.new` / `array.get` / `array.len`** — the GC instruction set.
3. **GC objects reach JS as opaque objects** — `e.new_point(3, 4)` returns an opaque JS object; JS cannot read its fields directly but can hand it back to Wasm.
4. **No linear memory** — the test asserts the module exports *no* `memory`: the data genuinely lives in the GC heap. This is what lets Java/Kotlin/Dart run "natively" against the host GC.

## Why wasm-tools, not wat2wasm?

wabt does not implement the GC proposal yet; `wasm-tools parse` does (by default). The build script downloads the right binary per platform into `<repo>/.tools/` (gitignored).

## Where you'd see this for real

- **Kotlin/Wasm** — Kotlin Multiplatform's web target (e.g. JetBrains Toolbox runs on it)
- **Java via GraalVM** — Google prototyped Java+WasmGC in Google Sheets
- **Dart/Flutter** — Flutter Web's Wasm build mode
