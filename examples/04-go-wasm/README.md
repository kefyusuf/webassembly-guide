# Example 04 — Go → WebAssembly (Official Target)

Compiles Go with `GOOS=js GOARCH=wasm`: the **entire Go runtime** (GC included) ships into the browser, and `syscall/js` gives you DOM/Web API access.

## Requirement

Go 1.21+ (nothing else).

## Build and test

```bash
./build.sh
node test.mjs
```

## What you learn

1. **`js.Global().Set("goSum", ...)`** — binding Go functions to the JS global scope; the browser can call `goSum(6, 7)`.
2. **DOM access** — `js.Global().Get("document")` for direct DOM manipulation (comfort Rust's raw target doesn't offer).
3. **wasm_exec.js** — the JS side of Go's runtime; copied from GOROOT, with `wasm_exec_node.js` as the Node test runner.
4. **The size cost** — output is ~2.5 MB because the GC'd Go runtime ships too. For smaller output use [TinyGo](https://tinygo.org/):

```bash
tinygo build -o dist/main-tiny.wasm -target wasm .   # ~95% smaller
```

## Expected output (node test.mjs)

```
== Go → Wasm ==
goSum(6, 7) = 13
goFib(30) = 832040
goFib(50) = 12586269025
```

To try it in the browser, see [07-web-demo](../07-web-demo/) (main.go writes into an element with id `output`).
