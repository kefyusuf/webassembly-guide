# Example 01 — WAT Basics: Hand-Written WebAssembly

Here we write modules by hand in Wasm's **text format (WAT)**. No compiler involved — you see Wasm's "assembly" directly. This is the exercise that teaches you how the format actually works.

## Requirement

The [WABT toolset](https://github.com/WebAssembly/wabt) — *or* just `npm install` (the run script falls back to the wabt npm package):

```bash
# Windows: winget install wabt   |  scoop install wabt
# macOS:   brew install wabt
# Linux:   apt install wabt  (or: npm install)
```

## Files

| File | What it teaches |
|---|---|
| `01-hello.wat` | The smallest module; exports, function calls |
| `02-arithmetic.wat` | Parameters, return values, the stack machine |
| `03-memory.wat` | Linear memory; writing/reading data shared with JS |
| `04-loops.wat` | Blocks, conditionals, loops (fibonacci) |
| `05-imports.wat` | **Importing** a function from JS |

## Compile and run

```bash
npm install       # only needed if wat2wasm is not on your PATH
node run.mjs      # compiles all .wat files and runs them in Node
```

## Feeling the stack machine

The `(a + b) * 2` example from `02-arithmetic.wat`:

```wat
(func (export "compute") (param $a i32) (param $b i32) (result i32)
  local.get $a      ;; stack: [a]
  local.get $b      ;; stack: [a, b]
  i32.add           ;; stack: [a+b]
  i32.const 2       ;; stack: [a+b, 2]
  i32.mul           ;; stack: [(a+b)*2]
)
```

Track the stack state next to each line — that's how you learn to read Wasm.
