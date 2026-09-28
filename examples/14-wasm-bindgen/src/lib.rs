//! Example 14 — "production Rust": the same ideas as example 02, but with
//! wasm-bindgen doing the heavy lifting. Compare with 02's raw pointers:
//!
//!   raw (02):                                  wasm-bindgen (this):
//!   greet_ptr() / greet_len()                  greet(name: &str) -> String
//!   manual Int32Array writes                   Counter as a JS class
//!
//! Strings, structs, getters/setters and ownership (free) cross the boundary
//! as first-class values — this is how real projects ship Rust to the web.

use wasm_bindgen::prelude::*;

/// Typed strings both ways.
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {name}! — typed strings across the boundary")
}

/// Floats, as before.
#[wasm_bindgen]
pub fn f2c(f: f64) -> f64 {
    (f - 32.0) * 5.0 / 9.0
}

/// A Rust struct surfaced to JS as a class with methods and a getter.
/// JS holds an owning reference; `free()` releases the Rust-side memory.
#[wasm_bindgen]
pub struct Counter {
    value: i32,
}

#[wasm_bindgen]
impl Counter {
    #[wasm_bindgen(constructor)]
    pub fn new(start: i32) -> Counter {
        Counter { value: start }
    }

    pub fn increment(&mut self, by: i32) {
        self.value += by;
    }

    #[wasm_bindgen(getter)]
    pub fn value(&self) -> i32 {
        self.value
    }
}
