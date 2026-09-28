#!/usr/bin/env bash
# Example 15 build: Rust → wasm32-wasip1-threads (shared memory + atomics)
#
# NOTE — version pin: wasi-threads is a *legacy* proposal. Wasmtime removed
# the `-S threads` flag in later releases (the successor is the
# shared-everything-threads proposal, which no guest toolchain targets yet).
# This example therefore pins wasmtime v25, the last comfortable generation
# that runs it. See README for the full story.
set -euo pipefail
cd "$(dirname "$0")"

REPO_ROOT="$(cd ../.. && pwd)"
TOOLS="$REPO_ROOT/.tools"
WT_VERSION=25.0.0
WT_NAME="wasmtime-v$WT_VERSION"
mkdir -p dist "$TOOLS"

# rustup target add wasm32-wasip1-threads   (if missing)
cargo build --release --target wasm32-wasip1-threads

# Fetch the pinned wasmtime once per machine (cache: <repo>/.tools, gitignored)
if [ ! -x "$TOOLS/$WT_NAME" ] && [ ! -x "$TOOLS/$WT_NAME.exe" ]; then
  echo "Downloading wasmtime v$WT_VERSION (pinned — see note above)..."
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
  # keep the version in the file name; keep the .exe suffix on Windows
  case "$ASSET" in
    *.zip) SUFFIX=".exe" ;;
    *)     SUFFIX="" ;;
  esac
  mv "$(find "$TMP/out" -name "$EXE" -type f | head -1)" "$TOOLS/$WT_NAME$SUFFIX"
  rm -rf "$TMP"
fi

if [ -x "$TOOLS/$WT_NAME.exe" ]; then WT="$TOOLS/$WT_NAME.exe"; else WT="$TOOLS/$WT_NAME"; fi

cp "target/wasm32-wasip1-threads/release/threads-example.wasm" dist/threads_example.wasm

echo "dist/threads_example.wasm ready ($(wc -c < dist/threads_example.wasm) bytes)"
echo "Run: $WT run -W threads=y -S threads=y dist/threads_example.wasm"
echo "Test: node test.mjs"
