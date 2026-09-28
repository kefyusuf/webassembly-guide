//! Example 15 — real threads inside the Wasm sandbox (wasi-threads).
//!
//! Target: wasm32-wasip1-threads (adds shared memory + atomics to the WASI
//! preview1 world; the runtime spawns host threads via the `thread-spawn`
//! import). Run with wasmtime: `wasmtime run -W threads=y main.wasm`
//!
//! Each worker increments a shared AtomicU32 INCREMENTS times with relaxed
//! ordering; the final `fetch_add(1)` on a completion counter uses
//! SeqCst — a small lesson in memory ordering. The total must be exactly
//! THREADS × INCREMENTS: lost updates are impossible with atomics.

use std::sync::atomic::{AtomicU32, Ordering};

const THREADS: u32 = 4;
const INCREMENTS: u32 = 25_000;

static COUNTER: AtomicU32 = AtomicU32::new(0);
/// Spawned workers signal completion here (see README: main stops polling
/// when every worker has finished).
static FINISHED: AtomicU32 = AtomicU32::new(0);

fn main() {
    let mut spawned = 0;
    for i in 0..THREADS {
        match std::thread::Builder::new()
            .spawn(move || {
                for _ in 0..INCREMENTS {
                    COUNTER.fetch_add(1, Ordering::Relaxed);
                }
                FINISHED.fetch_add(1, Ordering::SeqCst);
            })
        {
            Ok(_) => spawned += 1,
            Err(e) => println!("thread {i} failed to spawn: {e}"),
        }
    }
    println!("spawned {spawned} threads");

    // wasi-threads has no blocking join from the main "thread"; poll the
    // completion counter (relaxed is fine — only eventually-true matters,
    // and the atomic write of each worker is visible to reads).
    while FINISHED.load(Ordering::Relaxed) < spawned {
        std::hint::spin_loop();
    }

    println!("final count = {}", COUNTER.load(Ordering::SeqCst));
}
