#!/usr/bin/env bash
# Example 06 build: C → Wasm (Emscripten)
# Emscripten setup: https://emscripten.org/docs/getting_started/downloads.html
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p dist

# 1) A pure Wasm module (works in Node/bundlers; does not emit its own HTML)
emcc main.c -O3 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME=createModule \
  -s ENVIRONMENT=web,node \
  -o dist/c_module.js

echo "dist/c_module.js + dist/c_module.wasm ready"
echo "Node test: node test.mjs"
