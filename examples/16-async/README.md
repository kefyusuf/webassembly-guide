# Example 16 — Async Around a Synchronous Core (+ the WASI 0.3 Status)

**The problem:** Wasm execution is synchronous. Call an export on the main thread and the event loop is frozen until it returns — no UI repaints, no timers, nothing.

**The pattern that works everywhere today:** keep the module in a worker and await a message. This example *measures* the difference:

```
sync  : 626 ms,  0 heartbeats during call (loop frozen)
worker: 559 ms, 36 heartbeats during call (loop alive)
```

A 10 ms heartbeat timer runs on the main thread while the same wasm workload (30M × `fib(45)`) executes — synchronously vs inside a `worker_threads` Worker. The heartbeats are the proof of blocking vs liveness.

## Run

```bash
./../02-rust-web/build.sh   # prerequisite: the Rust module
node test.mjs               # asserts freeze/no-freeze + correct results
node run.mjs                # prints the raw JSON report
```

The pattern is identical in browsers: `new Worker()` + `postMessage` (or a `MessageChannel`), and the worker loads the same `.wasm`.

## What you learn

1. **Wasm calls are synchronous by design** — the freeze is measurable, not folklore.
2. **Workers are today's answer** — same module bytes, no code changes; the main thread stays responsive.
3. **BigInt crossing** — Rust's `u64` returns arrive as JS `BigInt`; structured clone handles them across workers too.

## WASI 0.3 async — the *real* future, verified status (September 2026)

WASI 0.3 adds native async: components can export `async func`s, hosts await them without burning threads. Where does it actually stand?

| Piece | Status |
|---|---|
| Specification | WASI 0.3 published with native async/await |
| **wasmtime** | WASI 0.3 support present (`wasi:cli@0.3.x`) |
| **Rust guest toolchain** | ❌ no `wasm32-wasip3` target yet (stable *or* nightly manifest); the `wasi` crate is still 0.2.x |
| Other languages | same story — p2 is the ceiling for guest compilers today |

**Conclusion:** there is no guest toolchain to compile an honest WASI 0.3 async example with yet — so this example teaches the async pattern that *is* production-ready, and this section documents the gap instead of pretending. When `wasm32-wasip3` lands, the async-export version of this demo goes here.

For the browser-side future, watch **JSPI** (JavaScript Promise Integration) — it lets synchronous Wasm call async JS APIs without workers; still behind flags in major browsers at the time of writing.
