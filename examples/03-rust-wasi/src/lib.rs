//! Example 03 — Rust → WASI (outside-the-browser target: wasm32-wasip1)
//!
//! WASI lets a Wasm module access the file system, clock and environment
//! variables **to the extent the runtime grants it**. This example:
//!   * reads an environment variable,
//!   * reads the clock,
//!   * writes and reads a file in the granted folder.
//!
//! Running (permissions are granted on the command line — not in the code!):
//!   wasmtime run --env WASI_USER=alice --dir=. rust_wasi_example.wasm
//! The same module also runs in Node (see test.mjs → node:wasi).

use std::time::SystemTime;

/// WASI modules use a single `_start` export to behave like a
/// command-line program (C's `main` equivalent).
#[no_mangle]
pub extern "C" fn _start() {
    // 1) Environment variables (visible only if the runtime granted them)
    println!("--- Environment variables ---");
    match std::env::var("WASI_USER") {
        Ok(v) => println!("WASI_USER = {v}"),
        Err(_) => println!("WASI_USER not defined (runtime didn't grant it)"),
    }

    // 2) Clock (WASI: the clock_time_get import)
    println!("\n--- Clock ---");
    let seconds = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    println!("Unix time: {seconds} seconds");

    // 3) File system (only folders opened by the runtime are visible)
    println!("\n--- File system ---");
    let file_path = "wasi-demo.txt";
    match std::fs::write(file_path, "Written from inside Wasm! 🚀") {
        Ok(()) => println!("{file_path} written"),
        Err(e) => println!("Write failed (no permission?): {e}"),
    }
    match std::fs::read_to_string(file_path) {
        Ok(content) => println!("{file_path} read back: {content}"),
        Err(e) => println!("Read failed: {e}"),
    }

    println!("\nWASI program finished.");
}
