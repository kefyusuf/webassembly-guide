#!/usr/bin/env bash
# Example 14 build: Rust + wasm-bindgen → web-target glue + wasm
set -euo pipefail
cd "$(dirname "$0")"

VERSION=0.2.129   # must match wasm-bindgen in Cargo.toml, exactly

# wasm-bindgen-cli: installed once per machine (cargo caches it)
if ! command -v wasm-bindgen >/dev/null 2>&1; then
  echo "Installing wasm-bindgen-cli $VERSION (first run only, ~2-4 min)..."
  cargo install wasm-bindgen-cli --version "$VERSION" --locked
fi

# The installed CLI version must match the library version, or binding
# generation fails with a confusing version-mismatch error.
INSTALLED="$(wasm-bindgen --version | awk '{print $2}')"
if [ "$INSTALLED" != "$VERSION" ]; then
  echo "wasm-bindgen-cli $INSTALLED != required $VERSION — reinstalling..."
  cargo install wasm-bindgen-cli --version "$VERSION" --locked --force
fi

cargo build --release --target wasm32-unknown-unknown
mkdir -p dist
wasm-bindgen --out-dir dist --target web \
  "target/wasm32-unknown-unknown/release/wasm_bindgen_example.wasm"

echo "dist/ ready — glue: wasm_bindgen_example.js, module: wasm_bindgen_example_bg.wasm"
echo "Test: node test.mjs"
