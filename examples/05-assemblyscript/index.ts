// Example 05 — AssemblyScript: Wasm with TypeScript-like syntax.
//
// AssemblyScript is a strict subset of TypeScript that compiles to Wasm:
//   * Types are mandatory and map to Wasm types (i32, f64, u8…)
//   * No standard JS library (no document, no fetch, not even Math.random —
//     deterministic Wasm is a goal)
//   * Memory management is manual but supported (built-in heap)
//
// Build: npm install && npm run asbuild

// --- Numeric functions: cross to JS without serialization ------------------

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function fib(n: i32): i64 {
  let a: i64 = 0;
  let b: i64 = 1;
  for (let i = 0; i < n; i++) {
    const t = a + b;
    a = b;
    b = t;
  }
  return a;
}

export function f2c(f: f64): f64 {
  return (f - 32.0) * 5.0 / 9.0;
}

// --- Pointers into linear memory --------------------------------------------
// (JS would pass strings via the ASC loader bridge; we keep this example
//  numeric because the loader deserves its own chapter — see README)

export function sumArray(ptr: usize, len: i32): i64 {
  let t: i64 = 0;
  for (let i = 0; i < len; i++) {
    t += load<i32>(ptr + (<usize>i << 2));
  }
  return t;
}
