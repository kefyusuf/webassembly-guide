#!/usr/bin/env bash
# Example 20 build: Rust async → wasm-bindgen web glue (wasm-bindgen-futures)
set -euo pipefail
cd "$(dirname "$0")"

VERSION=0.2.130   # must match wasm-bindgen in Cargo.toml, exactly (see 14)

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
  "target/wasm32-unknown-unknown/release/wasm_futures_ws.wasm"

echo "dist/ ready — glue: wasm_futures_ws.js, module: wasm_futures_ws_bg.wasm"
echo "Test: npm install (echo server dev-dep) && node test.mjs"
