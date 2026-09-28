# Example 06 — C → WebAssembly (Emscripten)

The standard way to port existing C/C++ code to the web: **Emscripten**. This example shows exporting a C module, returning strings, and zero-copy memory sharing with JS.

## Installing Emscripten

```bash
# Linux/macOS
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk && ./emsdk install latest && ./emsdk activate latest && source ./emsdk_env.sh

# Windows: the same emsdk with `emsdk.bat`; or try `winget install emscripten`
```

## Build and test

```bash
./build.sh
node test.mjs
```

## What you learn

1. **`EMSCRIPTEN_KEEPALIVE`** — marking functions for export (the `__attribute__((used))` equivalent).
2. **`MODULARIZE` + `EXPORT_NAME`** — wrapping Emscripten's generated JS bridge into a factory function.
3. **Returning strings** — a `char*` lives in the Emscripten heap; JS reads it with `UTF8ToString(ptr)`.
4. **Zero-copy memory** — `malloc` + `HEAPU8` + in-place processing + `free`: the high-performance pattern, shown on the C side.

## The classic scenario: porting an existing C library

Real-world cases (FFmpeg, SQLite, libwebp…) follow these steps:

```bash
emconfigure ./configure --host=wasm32 ...   # autotools-based libraries
emmake make
emcc libtarget.a app.c -o output.js
```

Emscripten can also emit asm.js (`-s WASM=0`) or a ready-made test page (`-o output.html`).
