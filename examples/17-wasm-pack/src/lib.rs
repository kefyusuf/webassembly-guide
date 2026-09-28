//! Example 17 — a Rust library packaged for npm with wasm-pack.
//!
//! Same wasm-bindgen types as example 14, but the build output is a real
//! npm package: pkg/ contains the glue, the .wasm, generated type
//! declarations (.d.ts) and a package.json — `npm publish`-ready.

use wasm_bindgen::prelude::*;

/// Iterative fibonacci — returns u64, arriving in JS as BigInt.
#[wasm_bindgen]
pub fn fib(n: u32) -> u64 {
    let (mut a, mut b) = (0u64, 1u64);
    for _ in 0..n {
        (a, b) = (b, a + b);
    }
    a
}

/// A last-in-first-out stack of i64 values, as a JS class.
#[wasm_bindgen]
pub struct Stack {
    items: Vec<i64>,
}

#[wasm_bindgen]
impl Stack {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Stack {
        Stack { items: Vec::new() }
    }

    pub fn push(&mut self, value: i64) {
        self.items.push(value);
    }

    pub fn pop(&mut self) -> Option<i64> {
        self.items.pop()
    }

    pub fn peek(&self) -> Option<i64> {
        self.items.last().copied()
    }
}
