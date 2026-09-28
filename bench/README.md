# Cross-Language Benchmark

The **same algorithm** (iterative `fib`), compiled by different Wasm toolchains, compared on **binary size** and **execution speed**.

## Run

```bash
node bench/compare.mjs          # human-readable table
node bench/compare.mjs --json   # machine-readable report
node bench/test.mjs             # verify correctness of the comparison
```

Prerequisites: examples 01, 02 and 05 built (03/04/11 add more rows to the size table). Example 01's artifacts are compiled automatically if missing.

## Sample output

```
Cross-language fib(40) benchmark (200 calls, avg ms)
----------------------------------------------------------
wat                0.0001 ms   fib40 = 102334155
rust               0.0001 ms   fib40 = 102334155
assemblyscript     0.0001 ms   fib40 = 102334155
----------------------------------------------------------
Binary sizes:
wat                  0.1 KB   (134 bytes)
rust                15.0 KB   (15337 bytes)
wasi                58.9 KB   (60296 bytes)
go                   2.4 MB   (2516219 bytes)
assemblyscript       0.2 KB   (222 bytes)
wasmgc               0.4 KB   (408 bytes)
```

## What this tells you (and what it doesn't)

- **Execution speed:** once compiled, Wasm is Wasm — an iterative fib is memory-bound and so short that all toolchains measure identically. Toolchain choice does *not* affect steady-state speed of simple loops. (Differences appear in startup, instantiation cost, and complex workloads like SIMD/vectorization.)
- **Binary size is where toolchains differ wildly** — 134 bytes (hand-written WAT) vs 2.4 MB (Go shipping its GC'd runtime) for the same logic. This is the "first-load cost" column of the language guide in [docs/en/03-languages-and-tools.md](../docs/en/03-languages-and-tools.md), now backed by real numbers.
- **Correctness is uniform:** fib(40) = 102334155 on every toolchain — Wasm's determinism in action.
