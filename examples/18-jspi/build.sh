#!/usr/bin/env bash
# Example 18 build: JSPI demo WAT → wasm via wasm-tools
set -euo pipefail
cd "$(dirname "$0")"

REPO_ROOT="$(cd ../.. && pwd)"
TOOLS="$REPO_ROOT/.tools"
mkdir -p dist "$TOOLS"

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

if [ -x "$TOOLS/wasm-tools" ]; then WT="$TOOLS/wasm-tools"; else WT="$TOOLS/wasm-tools.exe"; fi
"$WT" parse jspi.wat -o dist/jspi.wasm

echo "dist/jspi.wasm ready ($(wc -c < dist/jspi.wasm) bytes)"
echo "Test: node test.mjs"
