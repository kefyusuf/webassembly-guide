# Example 17 — wasm-pack: From Rust Crate to npm Package

The full shipping story: the same wasm-bindgen types as example 14, but built with **wasm-pack** into a `pkg/` folder that is a **real npm package** — glue, `.wasm`, `.d.ts` type declarations, and a generated `package.json`.

## Build and test

```bash
./build.sh       # downloads pinned wasm-pack 0.15.0 into <repo>/.tools
node test.mjs
```

The test runs the **entire npm lifecycle without touching the public registry**:

1. `npm pack pkg/` → `wasm-pack-example-0.1.0.tgz` (what `npm publish` would ship)
2. `npm install ./wasm-pack-example-0.1.0.tgz` into a throwaway consumer project
3. consumer code imports **by package name**, like any dependency:

```js
import init, { fib, Stack } from "wasm-pack-example";
await init({ module_or_path: readFileSync(req.resolve("wasm-pack-example/wasm_pack_example_bg.wasm")) });
// fib(30) → 832040n · new Stack().push(10n) → BigInt in, BigInt out
```

## What you learn

1. **`wasm-pack build --target web`** — one command: cargo build + wasm-bindgen glue + wasm-opt size pass + `.d.ts` generation + package.json.
2. **Publishing is one step away** — `npm publish --access public` from `pkg/` (this test intentionally stops before that; the local tarball exercises the identical install path).
3. **`.d.ts` for free** — editors autocomplete `fib` and `Stack` with real types.
4. **Node vs browser init** — Node's `fetch` can't do `file://`, so consumers pass wasm bytes or a URL explicitly; browsers fetch automatically.
5. **`i64` ↔ `BigInt`** — `Stack` holds `i64` values, so JS must use `10n`, not `10`. Type declarations make this visible before runtime.

## Real publishing

To actually publish: `cd pkg && npm publish --access public` (needs an npm account). Scoped variant: add `--scope @yourname` and name the package `@yourname/wasm-pack-example` in Cargo.toml.
