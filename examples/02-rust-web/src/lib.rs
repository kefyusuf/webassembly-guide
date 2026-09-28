//! Example 02 — Rust → WebAssembly (browser target: wasm32-unknown-unknown)
//!
//! This example deliberately does NOT use `wasm-bindgen`, so you can see at
//! the lowest level how Rust talks to JS:
//!   * Numeric types are exported directly.
//!   * Strings travel through linear memory (pointer + length).
//!
//! The automated version of this process with wasm-bindgen/wasm-pack is
//! described in the README.

use std::fmt::Write as _;

/// Simple addition: numbers cross the JS↔Wasm boundary with no serialization.
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Fibonacci (iterative): shows Wasm's loop/computation performance.
#[no_mangle]
pub extern "C" fn fib(n: u32) -> u64 {
    let (mut a, mut b) = (0u64, 1u64);
    for _ in 0..n {
        (a, b) = (b, a + b);
    }
    a
}

/// Fahrenheit → Celsius
#[no_mangle]
pub extern "C" fn f2c(f: f64) -> f64 {
    (f - 32.0) * 5.0 / 9.0
}

// ---------------------------------------------------------------------------
// String exchange — the lowest-level approach:
// Wasm keeps a static string in the data section; JS receives the memory
// address (ptr) and length. JS reads the very same bytes via `memory.buffer`.
// ---------------------------------------------------------------------------

const GREETING: &str = "Hello, this text lives in Rust memory!";

/// Returns the start address of the string.
#[no_mangle]
pub extern "C" fn greet_ptr() -> *const u8 {
    GREETING.as_ptr()
}

/// Returns the string's length in bytes.
#[no_mangle]
pub extern "C" fn greet_len() -> usize {
    GREETING.len()
}

// ---------------------------------------------------------------------------
// In-place processing (zero-copy): JS fills a buffer, Wasm transforms it in
// memory, JS reads it back. No copying — the core pattern of high-performance
// scenarios.
// ---------------------------------------------------------------------------

/// Uppercases `len` bytes in memory (ASCII; full Unicode case mapping needs
/// a unicode-aware library — see README notes).
///
/// # Safety
/// `ptr` must point to at least `len` writable bytes of Wasm memory.
#[no_mangle]
pub unsafe extern "C" fn to_uppercase(ptr: *mut u8, len: usize) {
    let slice = std::slice::from_raw_parts_mut(ptr, len);
    for b in slice.iter_mut() {
        if b.is_ascii_lowercase() {
            *b = b.to_ascii_uppercase();
        }
    }
}

/// An example reading from memory instead of the stack:
/// JS writes an i32 array, Wasm returns its sum.
///
/// # Safety
/// `ptr` must point to `len` readable i32 values in Wasm memory.
#[no_mangle]
pub unsafe extern "C" fn sum_array(ptr: *const i32, len: usize) -> i64 {
    let slice = std::slice::from_raw_parts(ptr, len);
    slice.iter().map(|&x| x as i64).sum()
}

/// Showcasing Rust's standard library: produce a formatted report and
/// return its length. (Real projects would need heap allocation with an
/// allocator for strings; here we only show that std code runs on wasm.)
#[no_mangle]
pub extern "C" fn report_length(n: i32) -> usize {
    let mut s = String::new();
    let _ = write!(s, "report for {n}");
    s.len()
}
