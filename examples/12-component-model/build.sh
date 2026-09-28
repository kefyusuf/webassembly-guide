#!/usr/bin/env bash
# Example 12 build: Rust + WIT → wasm32-wasip2 *component*
# The wasm32-wasip2 target (Rust 1.82+) wraps the core module into a real
# WebAssembly component automatically — no extra packaging step needed.
set -euo pipefail
cd "$(dirname "$0")"

REPO_ROOT="$(cd ../.. && pwd)"
TOOLS="$REPO_ROOT/.tools"
mkdir -p dist

# Fetch wasm-tools once per machine (cache lives in <repo>/.tools, gitignored)
if [ ! -x "$TOOLS/wasm-tools" ] && [ ! -x "$TOOLS/wasm-tools.exe" ]; then
  echo "Downloading wasm-tools..."
  VER="1.259.0"
  case "$(uname -s)" in
    Linux*)  ASSET="wasm-tools-$VER-x86_64-linux.tar.gz"; EXE="wasm-tools" ;;
    Darwin*) ASSET="wasm-tools-$VER-aarch64-macos.tar.gz";   EXE="wasm-tools" ;;
    MINGW*|MSYS*|CYGWIN*) ASSET="wasm-tools-$VER-x86_64-windows.zip"; EXE="wasm-tools.exe" ;;
    *) echo "Unsupported OS"; exit 1 ;;
  esac
  URL="https://github.com/bytecodealliance/wasm-tools/releases/download/v$VER/$ASSET"
  TMP="$(mktemp -d)"
  curl -sL -o "$TMP/asset" "$URL"
  case "$ASSET" in
    *.zip)    unzip -o -q "$TMP/asset" -d "$TMP/out" ;;
    *.tar.gz) mkdir -p "$TMP/out" && tar -xzf "$TMP/asset" -C "$TMP/out" ;;
  esac
  mv "$(find "$TMP/out" -name "$EXE" -type f | head -1)" "$TOOLS/$EXE"
  rm -rf "$TMP"
fi

# rustup target add wasm32-wasip2   (if missing)
cargo build --release --target wasm32-wasip2

cp "target/wasm32-wasip2/release/calc_component.wasm" dist/calculator.wasm

if [ -x "$TOOLS/wasm-tools" ]; then WT="$TOOLS/wasm-tools"; else WT="$TOOLS/wasm-tools.exe"; fi
"$WT" validate dist/calculator.wasm

echo "dist/calculator.wasm ready ($(wc -c < dist/calculator.wasm) bytes) — validated as a component"
echo "Test: node test.mjs"
