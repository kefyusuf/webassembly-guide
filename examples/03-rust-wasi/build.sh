#!/usr/bin/env bash
# Example 03 build: Rust → wasm32-wasip1 (WASI)
set -euo pipefail
cd "$(dirname "$0")"

# If the target is missing: rustup target add wasm32-wasip1
cargo build --release --target wasm32-wasip1

mkdir -p dist
cp "target/wasm32-wasip1/release/rust_wasi_example.wasm" dist/

echo "dist/rust_wasi_example.wasm ready ($(wc -c < dist/rust_wasi_example.wasm) bytes)"
echo "Node test : node test.mjs"
echo "wasmtime  : wasmtime run --env WASI_USER=alice --dir=. dist/rust_wasi_example.wasm"
