#!/usr/bin/env bash
# Example 10 build: minimal Blazor WebAssembly SPA → static publish bundle
# (SDK-only: no AOT, no external WASI SDK — see README "Path 2" for that).
set -euo pipefail
cd "$(dirname "$0")/BlazorExample"

dotnet publish -c Release -o publish
rm -rf ../dist && mkdir ../dist
cp -r publish/wwwroot/. ../dist/
rm -rf publish

echo "dist/ ready — static bundle: index.html + _framework/ (dotnet runtime, app DLL, boot script)"
echo "Serve it with any static server (e.g. python -m http.server -d ../dist)"
