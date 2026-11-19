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

## WASI 0.3 async — the gap this example documented is now closed

When this example was written (September 2026), WASI 0.3's native async had
no compilable guest toolchain — this section documented that gap honestly.
**It no longer holds:** `wasm32-wasip3` is Tier 2, stable since Rust 1.100
(2026-11-12), and wasmtime 46+ runs the final 0.3.0 spec. The async-export
version of this demo now lives in **[example 19](../19-wasi03-async/)** — a
CI-verified component whose async `run()` suspends five times through the
canonical task system, no threads.

| Piece | Status (November 2026) |
|---|---|
| Specification | WASI 0.3.0 ratified (2026-06-11) — async in the canonical ABI |
| **wasmtime** | final 0.3.0 support since v46 (this repo pins v49) |
| **Rust guest toolchain** | ✅ `wasm32-wasip3` Tier 2, stable Rust 1.100+ |
| Browser side | JSPI shipped in Chrome/Edge 137+ (see [example 18](../18-jspi/)) |

For the browser side of the async story, see [example 18 (JSPI)](../18-jspi/)
and [example 20 (wasm-bindgen-futures)](../20-wasm-futures-websocket/).
