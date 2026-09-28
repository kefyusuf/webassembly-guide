# Example 18 — JSPI: Synchronous Wasm, Asynchronous JavaScript

**JSPI (JavaScript Promise Integration)** lets a *fully synchronous* wasm module call a promise-returning JS import: the wasm execution **suspends**, the host event loop runs, and execution resumes when the promise settles. The wasm source contains no async anything — see [jspi.wat](jspi.wat): an ordinary import, an ordinary `call`.

## Run

```bash
./build.sh    # downloads wasm-tools into <repo>/.tools (once)
node test.mjs # requires Node 26+ (JSPI on by default) or a JSPI-flagged Node
```

The browser page [`jspi.html`](jspi.html) is deployed with the [live demo](https://kefyusuf.github.io/webassembly-guide/18-jspi/): it detects JSPI support, shows enable instructions when missing, and proves the page stays responsive (a spinner keeps spinning) during the 400 ms suspension.

## What you learn

1. **`new WebAssembly.Suspending(fn)`** — wraps a promise-returning function behind a raw sync import signature; wasm calls it like any function.
2. **`WebAssembly.promising(export)`** — wraps the *export* so calling it from JS yields a Promise instead of freezing the thread. (Static function, not a constructor — unlike `Suspending`.)
3. **Suspension is real** — the test's duration assertion (≥ 400 ms for two 200 ms awaits) proves wasm paused *inside* its call. A plain sync wasm call could never take that long.
4. **Zero changes to wasm** — the same module runs with or without JSPI; the host chooses the suspension semantics.

## Support status (September 2026)

| Runtime | JSPI |
|---|---|
| Node 26 | ✅ on by default (verified by this test) |
| Chrome / Edge 137+ | ✅ on by default |
| Older Chrome/Edge | ⚠ `chrome://flags/#enable-experimental-webassembly-features` |
| Firefox / Safari | ⚠ behind flags / in development |

## Why it matters

Today's async workaround is [example 16](../16-async/): move the module to a worker. JSPI removes the worker: long-running wasm code can call `fetch`, `setTimeout`, WebSocket messages — any async JS — from its own synchronous call graph. Combined with WASI 0.3's native async on the server side, "sync code that suspends" is becoming the standard wasm concurrency story on both sides.
