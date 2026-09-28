# Example 09 — Python and WebAssembly (Both Directions)

Python's relationship with Wasm has **two distinct directions** — both live in this folder:

## Direction 1: Python as a Wasm **host** (`wasmtime-py`)

Your Python application runs sandboxed Wasm modules inside itself (plugin systems, user code, secure computation).

```bash
pip install wasmtime
python run_wasmtime.py
```

`run_wasmtime.py` runs the module compiled in [03-rust-wasi](../03-rust-wasi/) from Python: it binds the WASI imports and defines the permissions (folder, env) on the Python side.

## Direction 2: Python **inside** Wasm (Pyodide)

[Pyodide](https://pyodide.org/) is CPython compiled to Wasm: it runs Python — plus NumPy/Pandas/SciPy — in the browser.

- `pyodide_demo.html` — a working in-browser Python demo (loads from a CDN; serve with `python -m http.server`)
- JupyterLite is one of the production-grade Pyodide deployments

> ⚠️ Important distinction: Python code is not **compiled** to Wasm; the CPython **interpreter** is. Expect native-Python-like (slightly slower) speed — not Rust/C speed.

## Why it matters

- **Server side:** the "run user code" problem (notebook services, game servers, workflow engines) is solved with a Wasm sandbox — every tenant isolated.
- **Browser side:** data is analyzed without ever leaving the client (privacy), and server costs drop.
