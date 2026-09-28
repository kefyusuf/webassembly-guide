# Example 09, direction 1 — Python as a Wasm host (wasmtime-py)
# Setup: pip install wasmtime
# Prerequisite: cd ../03-rust-wasi && ./build.sh  (dist/rust_wasi_example.wasm)

import sys
from pathlib import Path

module_path = Path(__file__).parent.parent / "03-rust-wasi" / "dist" / "rust_wasi_example.wasm"
if not module_path.exists():
    sys.exit("Build first: cd ../03-rust-wasi && ./build.sh")

try:
    from wasmtime import Store, Module, Linker, WasiConfig
except ImportError:
    sys.exit("Install: pip install wasmtime")

# --- 1) Store: an isolated world (each module lives in its own store) -------
store = Store()

# --- 2) WASI configuration: PERMISSIONS ARE GRANTED HERE ---------------------
wasi = WasiConfig()
wasi.argv = ["rust_wasi_example"]
wasi.env = [("WASI_USER", "alice")]          # env-var permission (list of (name, value))
wasi.inherit_stdout()                         # connect stdout to the terminal
wasi.inherit_stderr()
wasi.preopen_dir(".", "/")                    # only this folder is visible (as "/")
store.set_wasi(wasi)

# --- 3) Compile the module + link -------------------------------------------
module = Module.from_file(store.engine, str(module_path))
linker = Linker(store.engine)
linker.define_wasi()  # bind the WASI imports (fd_write, clock_time_get…)

instance = linker.instantiate(store, module)

# --- 4) Run --------------------------------------------------------------------
# The _start function is the program's entry point
start = instance.exports(store)["_start"]
start(store)

print("\n[Python] The module was executed by Python, inside a sandbox.")
print("[Python] Try it: delete the wasi.env line → WASI_USER becomes invisible.")
