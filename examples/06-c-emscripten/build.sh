#!/usr/bin/env bash
# Example 06 build: C → Wasm (Emscripten)
# Emscripten setup: https://emscripten.org/docs/getting_started/downloads.html
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p dist

# 1) A pure Wasm module as an ES module (works in Node 18+ and bundlers)
#    EXPORT_ES6 avoids mixing require() with top-level await in the glue.
emcc main.c -O3 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME=createModule \
  -s EXPORT_ES6=1 \
  -s "EXPORTED_RUNTIME_METHODS=['UTF8ToString','HEAPU8']" \
  -s "EXPORTED_FUNCTIONS=['_malloc','_free']" \
  -s ENVIRONMENT=web,node \
  -o dist/c_module.js

echo "dist/c_module.js + dist/c_module.wasm ready"
echo "Node test: node test.mjs"
