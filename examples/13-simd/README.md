# Example 13 — SIMD: Scalar vs Vectorized (Raw WAT)

The final "spoken claim → measured number" of this repository: the docs mention SIMD speedups — here it is, measured. Both functions sum an i32 array; one processes one element per iteration, the other four lanes at a time with `v128`.

## Build and test

```bash
./build.sh       # downloads wasm-tools once into <repo>/.tools
node test.mjs
```

## What you learn

1. **`v128` and SIMD instructions in WAT** — `v128.load`, `i64x2.extend_low/high_i32x4_s`, `i64x2.add`, `i64x2.extract_lane`.
2. **Widening as the overflow escape hatch** — accumulate in i64 lanes, not i32, so large sums never wrap.
3. **Unit discipline** — `$len` counts *elements*, addresses are *bytes*: the test's first draft confused the two and summed a quarter of the array. A correctness-first test catches exactly this class of bug.
4. **Measured speedup** — on the authoring machine (1,048,576 elements):

```
scalar: 0.327 ms/call   simd: 0.122 ms/call   → 2.68x
```

Not the theoretical 4×: the loop is memory-bound, and widening costs extra instructions. Real-world SIMD speedups depend on the workload — which is exactly why this repo measures instead of repeating folklore.

## Design notes

- `len` must be a multiple of 4 (the SIMD path processes 4 lanes per iteration).
- The test verifies correctness on both paths against a JS reference, proves `v128` instructions exist via `wasm-tools print`, and reports timing informationally only — CI VMs are too noisy for speed assertions.
- SIMD is standard since Wasm 2.0; `wasm-tools parse` accepts it by default (like example 11's GC types).
