// Example 19 — WASI 0.3 native async (wasm32-wasip3, Tier 2).
//
// WASI 0.3.0 (ratified 2026-06-11) moved async into the Component Model's
// canonical ABI: `async func`, `stream<T>` and `future<T>` are core — no
// more `wasi:io/poll` state machines, no threads. wasmtime 46+ awaits this
// component's async `run()` like it would await any host future: the guest
// suspends via the canonical task system (task.yield) and the host keeps
// polling — cooperative, zero threads.
//
// Run: wasmtime run wasi03_async.wasm

wit_bindgen::generate!({
    path: "wit",
    world: "wasi03-async",
});

use crate::exports::wasi::cli::run;

struct Component;

impl run::Guest for Component {
    async fn run() -> Result<(), ()> {
        // Five cooperative yields — each one suspends the task through the
        // canonical ABI and hands control back to the host scheduler.
        for i in 1..=5 {
            eprintln!("yield {i}: suspending task, host regains control");
            wit_bindgen::yield_async().await;
        }
        eprintln!("completed=5");
        Ok(())
    }
}

export!(Component);
