# Example 05 — AssemblyScript → WebAssembly

The lowest-friction entry point for a TypeScript developer writing Wasm. The syntax resembles TS, but the language is shaped by Wasm's constraints (static types, no JS stdlib).

## Build and test

```bash
npm install
npm start        # asbuild + node test.mjs
```

## What you learn

1. **TypeScript with Wasm types** — `i32`, `i64`, `f64` are real Wasm types, not TS `number`.
2. **No JS stdlib** — no `Math.random`, `fetch`, `document`; the language is deliberately deterministic and sandbox-friendly.
3. **Memory pointers** — `load<i32>`/`store<i32>` raw memory access (see `sumArray`).
4. **The loader** — exposing managed types (string, array classes) to JS requires `@assemblyscript/loader`; this example sticks to numeric types, the README links point to the loader docs.

## Expected output

```
== AssemblyScript → Wasm ==
add(6, 7) = 13
fib(30) = 832040
fib(50) = 12586269025
f2c(100) = 37.8
sumArray = 110
```

## When AssemblyScript?

- A JS/TS team wants to learn Wasm → the fastest on-ramp
- Small, fast, numeric helper modules (hashing, crypto, pixel processing)
- Teams that don't want to learn Rust

When not: if you need a broad ecosystem/existing libraries → Rust/C++.
