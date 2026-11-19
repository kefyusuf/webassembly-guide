# Example 19 — WASI 0.3 Native Async (wasm32-wasip3)

WASI 0.3.0 was ratified on **2026-06-11** and moved async into the Component
Model's canonical ABI itself: `async func`, `stream<T>` and `future<T>` are
core primitives — no more `wasi:io/poll` state machines, no threads. Rust
shipped the `wasm32-wasip3` target as Tier 2, and the nightly-only caveat
ended with **Rust 1.100** (2026-11-12). This example is a real, CI-verified
guest on that toolchain.

## What it does

A command component whose `run()` is a **native async function**. The host
(wasmtime 46+) awaits it like any host future: the guest suspends on the
canonical task system (`task.yield`) five times and the host keeps polling —
cooperative scheduling with **zero threads**:

```
yield 1: suspending task, host regains control
…
yield 5: suspending task, host regains control
completed=5
```

`test.mjs` asserts all five suspension/resumption cycles plus completion.

## The pieces

| Piece | Version | Why |
|---|---|---|
| `wasm32-wasip3` target | Rust **1.100+** | Tier 2; produces a component by default |
| `wit-bindgen` + `async` feature | 0.63 | async codegen for 0.3 worlds |
| `wkg wit fetch` | wkg 0.15+ | fetches the `wasi:cli@0.3.0` WIT package into `wit/deps` |
| wasmtime (pinned) | **49.0.1** | 46+ implements the final 0.3.0 spec |

Files:

```
19-wasi03-async/
├── wit/world.wit        world exporting wasi:cli/run@0.3.0
├── src/lib.rs           async fn run() — 5 canonical task.yield suspensions
├── build.sh             target check → wkg wit fetch → cargo build → pinned wasmtime
└── test.mjs             spawns wasmtime, asserts the 5 suspensions + completion
```

```bash
bash build.sh      # first run: installs wkg (~2-4 min), fetches WIT, builds
node test.mjs
```

## Key lessons

- **The async future crosses the component boundary natively.** The exported
  `run()` is lifted with the 0.3 async ABI (`[task-return]run`,
  `[waitable-set-*]` builtins — inspect with `wasm-tools print`). The guest
  suspends with `wit_bindgen::yield_async().await` (the canonical
  `task.yield`); the host regains control between polls. Nothing blocks.
- **`wasmtime --invoke` cannot drive async exports.** Invoking the async
  function directly hung even with `-W component-model-async=y` — the CLI's
  invoke path doesn't pump the async task loop. The supported path is a
  command component (`wasi:cli/run@0.3.0`): plain `wasmtime run` awaits the
  async task natively. (wit-bindgen's `yield_async()` is itself just
  `Pending` + `wake_by_ref()` — the yield primitive is simple; what matters
  is that the host pumps tasks, which `run` does and `--invoke` doesn't.)
- **`wasmtime --invoke` is sync-only for async exports.** Invoking the async
  function directly hangs even with `-W component-model-async=y`. The
  supported path is a command component (`wasi:cli/run@0.3.0`), which the
  CLI awaits natively.
- **Version alignment is a family rule now:** Rust ≥ 1.100 ↔ wasmtime ≥ 46 ↔
  wit-bindgen ≥ 0.57 (0.3 codegen) ↔ wkg ≥ 0.15. Same discipline as
  example 12 (wit-bindgen ↔ rustc) and example 14 (crate ↔ CLI).
- wit-bindgen's async `Guest` methods take **no `&self`** — the exported
  future is owned by the host's task system, not a borrowed instance.

## Watch out for

- `wkg wit fetch` needs network (packages live on the wa.dev OCI registry);
  `wit/deps/` is fetched, not committed.
- The `wasi:cli@0.3.0` imports come from the **target's std**, which links
  them even when your world doesn't use them (inspect:
  `wasm-tools component wit dist/wasi03_async.wasm`).
- WASI 0.3 moved stream I/O to async lowering too — `stdout/stderr` writes
  in this component are `[async-lower]` calls under the hood.
