# Example 15 — Real Threads Inside the Sandbox (wasi-threads)

The `wasm32-wasip1-threads` target adds **shared memory + atomics** to WASI: `std::thread` works, and 4 worker threads increment a shared `AtomicU32` 25,000 times each — the final count is exactly 100,000, no lost updates.

## Build and test

```bash
rustup target add wasm32-wasip1-threads   # once
./build.sh       # builds + downloads a pinned wasmtime into <repo>/.tools
node test.mjs
```

## What you learn

1. **Threads are real parallelism, not async** — each worker is a host OS thread executing the same wasm code over shared linear memory.
2. **Atomics are the contract** — `AtomicU32::fetch_add` with `Relaxed` ordering for the counters; the final read uses `SeqCst`. Naive `u32 += 1` would lose updates.
3. **wasi-threads has no blocking join** — main polls a completion atomic. (The browser story has proper workers + `Atomics.wait`.)
4. **Shared memory crosses as an import** — the module imports `env.memory` (shared); the runtime provides it. That's why two flags are needed: `-W threads=y` (wasm threads proposal) and `-S threads=y` (WASI threading imports).

## The honest status (2026): legacy, in transition

This example is deliberately transparent about ecosystem flux:

- **wasi-threads is legacy.** The successor is the **shared-everything-threads** proposal (already visible in wasmtime as `-W shared-everything-threads`), but no guest toolchain targets it yet.
- **wasmtime removed `-S threads` in recent releases** — this example pins **wasmtime v25.0.0** (last comfortable generation that runs it). The pin lives in `build.sh`, with a version-suffixed binary so it coexists with other tooling.
- If you hit `unknown import: env::memory` or "flag no longer supported", you're feeling exactly this transition.

Threads in the **browser** work fine (Web Workers + `SharedArrayBuffer`) but require COOP/COEP response headers for cross-origin isolation — GitHub Pages can't send them, so this example stays on the wasmtime path.
