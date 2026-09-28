# Example 12 — The Component Model: Rust + WIT → wasm32-wasip2

The Component Model is Wasm's "next big thing": modules stop speaking raw numbers and start speaking **typed interfaces** defined in **WIT** (WebAssembly Interface Types). Strings and lists cross the boundary natively — no pointer + length gymnastics like in [example 02](../02-rust-web/).

## Build and test

```bash
rustup target add wasm32-wasip2   # once
./build.sh                        # cargo build + wasm-tools validate
node test.mjs                     # inspects the component's WIT interface
```

The build script downloads `wasm-tools` into `<repo>/.tools/` (gitignored) on first run.

## The workflow

1. **Define the contract** in `wit/calculator.wit`:

```wit
package demo:calc@1.0.0;

world calculator {
  export sum: func(values: list<f64>) -> f64;
  export greet: func(name: string) -> string;
}
```

2. **Implement it in Rust** (`src/lib.rs`): `wit_bindgen::generate!` produces the bindings; you implement a `Guest` trait — `Vec<f64>` and `String` map straight to WIT `list<f64>` and `string`.

3. **Build**: `cargo build --target wasm32-wasip2`. Since Rust 1.82 this target emits a real **component** (not just a core module) — validated by `wasm-tools validate` in the build script.

4. **Inspect** with `node test.mjs`: `wasm-tools component wit` prints the component's interface — you'll see `export sum: func(values: list<f64>) -> f64` exactly as authored, plus the standard `wasi:*` imports the runtime offers.

**Consume it from Python** (`test_component.py`) — the other half of the story:

```python
linker = Linker(store.engine)
linker.add_wasip2()                                   # host provides wasi:*
instance = linker.instantiate(store, comp)
sum_func = instance.get_func(store, "sum")            # typed export
total = sum_func(store, [1.5, 2.5, -4.0, 10.0])       # → 10.0
```

Python calls the Rust-built component's exports directly — `list<f64>` and `string` cross the boundary as native Python values (the test even round-trips `"Ayşe"` to prove Unicode correctness). Run with `pip install wasmtime && python test_component.py`.

## What you learn

1. **WIT is the contract** — hosts see only the world's exports, typed and documented.
2. **Rich types at the boundary** — the test asserts `list<f64>` appears in the interface: this is what "no serialization" means at the component level.
3. **wasip2 components are standard now** — the WASI 0.2/0.3 ecosystem (wasmtime, wasmCloud, Spin) consumes exactly this artifact.

## Notes

- The component's WIT reports its package as `root:component` — rustc's wrapper doesn't embed the custom package name; the typed exports are the contract that matters. Full package metadata embedding is the job of `wasm-tools component embed/new` in more advanced pipelines.
- To *run* the component: install [wasmtime](https://wasmtime.dev/) and use `wasmtime run` or its component API bindings (Python/Go/C# …) — that's the "hosts import components" story of [docs/en/06-ecosystem.md](../../docs/en/06-ecosystem.md).
