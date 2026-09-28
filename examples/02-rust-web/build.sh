#!/usr/bin/env bash
# Example 02 build: Rust → wasm32-unknown-unknown
set -euo pipefail
cd "$(dirname "$0")"

# If the target is missing: rustup target add wasm32-unknown-unknown
cargo build --release --target wasm32-unknown-unknown

mkdir -p dist
cp "target/wasm32-unknown-unknown/release/rust_web_example.wasm" dist/

echo "dist/rust_web_example.wasm ready ($(wc -c < dist/rust_web_example.wasm) bytes)"
echo "Test:   node test.mjs"
