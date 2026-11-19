#!/usr/bin/env bash
# Example 19 build: Rust → wasm32-wasip3 (WASI 0.3 component, native async)
#
# Version pins that must line up (see README):
#   Rust   1.100+  — wasm32-wasip3 is Tier 2; nightly ended with 1.100 (2026-11)
#   wasmtime 46+   — first runtime implementing the final WASI 0.3.0 spec
#                    (this example pins 49.0.1, same as the Docker image)
#   wit-bindgen 0.63 (+ async feature) — async codegen for 0.3 worlds
#   wkg 0.15+      — fetches wasi:cli@0.3.0 WIT packages (0.3 support)
set -euo pipefail
cd "$(dirname "$0")"

REPO_ROOT="$(cd ../.. && pwd)"
TOOLS="$REPO_ROOT/.tools"
WT_VERSION=49.0.1
WT_NAME="wasmtime-v$WT_VERSION"
mkdir -p dist "$TOOLS"

# wasm32-wasip3: stable since Rust 1.100 — add it if the toolchain lacks it
if ! rustup target list --installed | grep -q wasm32-wasip3; then
  echo "Adding wasm32-wasip3 target (needs Rust 1.100+)..."
  rustup target add wasm32-wasip3
fi

# wkg: fetches the wasi:cli@0.3.0 WIT packages referenced by the world
if ! command -v wkg >/dev/null 2>&1; then
  echo "Installing wkg (cargo install, one-time, ~2-4 min)..."
  cargo install wkg --locked
fi
wkg wit fetch

cargo build --release --target wasm32-wasip3

# Fetch the pinned wasmtime once per machine (cache: <repo>/.tools, gitignored)
if [ ! -x "$TOOLS/$WT_NAME" ] && [ ! -x "$TOOLS/$WT_NAME.exe" ]; then
  echo "Downloading wasmtime v$WT_VERSION (pinned — WASI 0.3 needs 46+)..."
  case "$(uname -s)" in
    Linux*)  ASSET="wasmtime-v$WT_VERSION-x86_64-linux.tar.xz"; EXE="wasmtime" ;;
    Darwin*) ASSET="wasmtime-v$WT_VERSION-aarch64-macos.tar.xz"; EXE="wasmtime" ;;
    MINGW*|MSYS*|CYGWIN*) ASSET="wasmtime-v$WT_VERSION-x86_64-windows.zip"; EXE="wasmtime.exe" ;;
    *) echo "Unsupported OS"; exit 1 ;;
  esac
  URL="https://github.com/bytecodealliance/wasmtime/releases/download/v$WT_VERSION/$ASSET"
  TMP="$(mktemp -d)"
  curl -sL -o "$TMP/asset" "$URL"
  case "$ASSET" in
    *.zip)    unzip -o -q "$TMP/asset" -d "$TMP/out" ;;
    *.tar.xz) mkdir -p "$TMP/out" && tar -xJf "$TMP/asset" -C "$TMP/out" ;;
  esac
  case "$ASSET" in
    *.zip) SUFFIX=".exe" ;;
    *)     SUFFIX="" ;;
  esac
  mv "$(find "$TMP/out" -name "$EXE" -type f | head -1)" "$TOOLS/$WT_NAME$SUFFIX"
  rm -rf "$TMP"
fi

if [ -x "$TOOLS/$WT_NAME.exe" ]; then WT="$TOOLS/$WT_NAME.exe"; else WT="$TOOLS/$WT_NAME"; fi

cp "target/wasm32-wasip3/release/wasi03_async.wasm" dist/wasi03_async.wasm

echo "dist/wasi03_async.wasm ready ($(wc -c < dist/wasi03_async.wasm) bytes)"
echo "Run: $WT run dist/wasi03_async.wasm"
echo "Test: node test.mjs"
