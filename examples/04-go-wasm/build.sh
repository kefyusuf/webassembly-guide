#!/usr/bin/env bash
# Example 04 build: Go → wasm (official target)
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p dist

GOOS=js GOARCH=wasm go build -o dist/main.wasm .

# The JS side of Go's runtime — copied from GOROOT
# (Go 1.24+ moved these to lib/wasm; older versions keep them in misc/wasm)
GOROOT="$(go env GOROOT)"
if [ -f "$GOROOT/lib/wasm/wasm_exec.js" ]; then
  cp "$GOROOT/lib/wasm/wasm_exec.js" dist/wasm_exec.js
  cp "$GOROOT/lib/wasm/wasm_exec_node.js" dist/wasm_exec_node.js
else
  cp "$GOROOT/misc/wasm/wasm_exec.js" dist/wasm_exec.js
  cp "$GOROOT/misc/wasm/wasm_exec_node.js" dist/wasm_exec_node.js 2>/dev/null || true
fi

echo "dist/main.wasm ready ($(wc -c < dist/main.wasm) bytes)"
echo "Test: node test.mjs"
