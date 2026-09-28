# Example 07 — Browser Demo

A single HTML page that runs the compiled modules from this repository in the browser.

## Running

1. Build the relevant examples first (at least 02, 04, 05):

```bash
cd ..
( cd 02-rust-web        && ./build.sh )
( cd 04-go-wasm         && ./build.sh )
( cd 05-assemblyscript  && npm install && npm run asbuild )
```

2. Start a local server (browsers refuse to load Wasm over `file://` — CORS):

```bash
python -m http.server 8080
# or: npx serve
```

3. Open <http://localhost:8080/07-web-demo/> in a browser and watch the DevTools console.

## What it demonstrates

- `WebAssembly.instantiateStreaming` — streaming compilation and instantiation
- Calling exported functions from buttons (numeric values)
- Reading the static string from the Rust module (pointer + length + TextDecoder)
- The Go module writing into the DOM (the power of the `syscall/js` bridge)
- Memory sharing in the AssemblyScript and Rust modules

## Notes

- If you also built the Emscripten example (06), the page tries it too.
- The UI is deliberately plain — the goal is to show the JS↔Wasm bridge.
