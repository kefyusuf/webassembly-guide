#!/usr/bin/env bash
# Example 17 build: wasm-pack → pkg/ (an npm-publish-ready package)
set -euo pipefail
cd "$(dirname "$0")"

REPO_ROOT="$(cd ../.. && pwd)"
TOOLS="$REPO_ROOT/.tools"
WP_VERSION=0.15.0
WP_NAME="wasm-pack-v$WP_VERSION"
mkdir -p "$TOOLS"

# Fetch the pinned wasm-pack once per machine (cache: <repo>/.tools)
if [ ! -x "$TOOLS/$WP_NAME" ] && [ ! -x "$TOOLS/$WP_NAME.exe" ]; then
  echo "Downloading wasm-pack v$WP_VERSION..."
  case "$(uname -s)" in
    Linux*)  ASSET="wasm-pack-v$WP_VERSION-x86_64-unknown-linux-musl.tar.gz"; EXE="wasm-pack" ;;
    Darwin*) ASSET="wasm-pack-v$WP_VERSION-aarch64-apple-darwin.tar.gz"; EXE="wasm-pack" ;;
    MINGW*|MSYS*|CYGWIN*) ASSET="wasm-pack-v$WP_VERSION-x86_64-pc-windows-msvc.tar.gz"; EXE="wasm-pack.exe" ;;
    *) echo "Unsupported OS"; exit 1 ;;
  esac
  URL="https://github.com/wasm-bindgen/wasm-pack/releases/download/v$WP_VERSION/$ASSET"
  TMP="$(mktemp -d)"
  curl -sL -o "$TMP/asset" "$URL"
  mkdir -p "$TMP/out" && tar -xzf "$TMP/asset" -C "$TMP/out"
  case "$ASSET" in
    *.zip) SUFFIX=".exe" ;;
    *)     SUFFIX="" ;;
  esac
  mv "$(find "$TMP/out" -name "$EXE" -type f | head -1)" "$TOOLS/$WP_NAME$SUFFIX"
  rm -rf "$TMP"
fi

if [ -x "$TOOLS/$WP_NAME.exe" ]; then WP="$TOOLS/$WP_NAME.exe"; else WP="$TOOLS/$WP_NAME"; fi

# --release + --target web: ESM glue for browsers and modern Node.
# wasm-pack also runs wasm-opt (binaryen) — it downloads its own copy.
# Windows runners hit flaky LNK1104 temp-file linker races; retry once.
"$WP" build --release --target web --out-dir pkg || {
  echo "wasm-pack build failed (flaky Windows linker?) — retrying once..."
  sleep 2
  "$WP" build --release --target web --out-dir pkg
}

echo "pkg/ ready — npm-publish-ready package (glue + .wasm + .d.ts + package.json)"
echo "Test: node test.mjs"
