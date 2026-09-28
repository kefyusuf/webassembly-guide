# 2. How Does WebAssembly Work?

## The binary format (`.wasm`)

A Wasm module is encoded as compact binary **sections**:

| Section | Content |
|---|---|
| Type | Function signatures (parameter/return types) |
| Import | Functions/memory/globals expected from the outside |
| Function | Indices of the module's own functions |
| Memory | Linear memory definition (min/max pages) |
| Global | Constant/mutable globals |
| Export | Names exposed to the outside |
| Start | Function executed on instantiation |
| Code | Function bodies (the actual instructions) |
| Data | Static data loaded into memory |

The compact design means `.wasm` files are often **smaller than equivalent JS** (with gzip/brotli) and can be **compiled in a streaming fashion** (compilation starts while the download is in flight → `WebAssembly.instantiateStreaming`).

## A stack machine

Wasm is a **stack-based** virtual machine. Instructions take their operands from the stack and push results back. For `(a + b) * c`:

```
local.get $a    ;; push a
local.get $b    ;; push b
i32.add         ;; pop two, push sum
local.get $c    ;; push c
i32.mul         ;; pop two, push product
```

The stack discipline makes validation a **single pass**: the browser can fully verify type safety *before* running the module. This is the technical foundation of the "safe and fast" promise.

## WAT — the text representation

The binary format has a one-to-one text counterpart, **WAT** (WebAssembly Text format). It's hand-writable and readable (see [examples/01-wat-basics](../../examples/01-wat-basics/)):

```wat
(module
  ;; fahrenheit → celsius: (f - 32) * 5 / 9
  (func (export "f2c") (param $f f64) (result f64)
    (f64.mul
      (f64.sub (local.get $f) (f64.const 32))
      (f64.const 0.5555555555555556))))
```

`wat2wasm` (from the WABT toolset) converts text to binary; `wasm2wat` reads it back — like reading minified JS, but far more structured.

## A limited type system

Wasm's MVP had only numeric types; today (with Wasm 2.0/3.0):

- `i32`, `i64`, `f32`, `f64` — basic numeric types
- `v128` — SIMD
- `funcref`, `externref` — reference types
- **WasmGC** — struct and array types, targeting garbage-collected languages (Java, Kotlin, Dart, Python)

Because of this limitation, **complex data like strings, arrays and objects cannot cross the Wasm↔JS boundary directly**; they are serialized through linear memory (below) or carried via `externref`/GC types.

## Linear memory

All of a Wasm module's data lives in **linear memory**, a contiguous byte array. Memory:

- grows in **pages** (1 page = 64 KiB)
- comes in 32-bit (max ~4 GiB) and **64-bit** (memory64) variants as of Wasm 3.0
- has **bounds-checked** access — even in C, a buffer overflow cannot escape the sandbox (it traps safely instead of segfaulting)

Data exchange with JS typically looks like:

```js
const memory = instance.exports.memory;         // WebAssembly.Memory
const bytes = new Uint8Array(memory.buffer);    // shared view
bytes.set(new TextEncoder().encode("hello"));   // copy data into Wasm memory
const ptr = instance.exports.allocate(8);       // allocate on the Wasm side
const result = instance.exports.process(ptr, 8);
```

In other words, **the string itself doesn't cross the boundary; a memory address (pointer) + length do**. Tools like `wasm-bindgen` and `embind` automate this.

## Lifecycle in the browser

```js
// 1. Compile (streaming — compilation finishes as the download does)
const { instance } = await WebAssembly.instantiateStreaming(
  fetch("module.wasm"),
  { env: { log: (n) => console.log(n) } }   // imports the module asks of JS
);

// 2. Call an exported function
console.log(instance.exports.add(2, 40));   // 42
```

The compiled artifact is a `WebAssembly.Module`; `instantiate` takes the imports to bind and returns a `WebAssembly.Instance`. The import/export mechanism also lets modules **import each other** — the foundation of the Component Model.

## Where does the speed come from?

1. **AOT-like compilation:** static types let the browser generate machine code in a single pass — no "speculate-then-verify" loop like a JS JIT.
2. **Compact format:** parsing and validation are cheap; streaming compilation hides download latency.
3. **Predictable performance:** no GC pauses (unless using WasmGC), no deopts — which matters for real-time workloads.

Realistic expectation: **70–95%** of native speed (workload-dependent). Typically **2–20×** faster than JS. *(These are community-reported ranges — this repo does not benchmark native-vs-wasm; [bench/](../../bench/) measures what we can: cross-toolchain size and speed.)*

## Lifecycle outside the browser (WASI)

Outside the browser, a **runtime** (wasmtime, Wasmer, WasmEdge, Node) loads the module and provides host functions as imports:

```
hello.wasm  ──▶  wasmtime run hello.wasm
                    │  sandbox + WASI imports (fd_read, clock_time_get…)
                    ▼
                Operating system
```

The host app (say, a database) only grants **the** host functions it chooses: no file access granted means the module cannot touch files — permissions live in the **configuration**, not in the code (capability-based security). This makes Wasm a much finer isolation unit than a Docker container (microsecond startup, kilobytes of memory).

## Summary flow

```
Source code → compile to Wasm (.wasm) → load (browser/runtime)
    → validate (type safety in a single pass) → compile (JIT/AOT)
    → execute sandboxed (linear memory + bounds checks)
    → talk to JS/host via imports & exports
```
