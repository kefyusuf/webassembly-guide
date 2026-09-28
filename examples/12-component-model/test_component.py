# Example 12, part 2 — Python as a component HOST (wasmtime-py)
# TDD: verifies the component built by ./build.sh can be instantiated by a
# Python host and its typed exports called — including a Unicode string
# crossing the boundary intact.
#
#   pip install wasmtime
#   python test_component.py

import sys
from pathlib import Path

from wasmtime import Store
from wasmtime.component import Component, Linker

component = Path(__file__).resolve().parent / "dist" / "calculator.wasm"
assert component.exists(), "dist/calculator.wasm missing — run ./build.sh first"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

store = Store()
comp = Component.from_file(store.engine, str(component))

# The component imports wasi:io/clocks/cli (Rust std needs them); the linker
# hands it the host's WASI 0.2 implementations.
linker = Linker(store.engine)
linker.add_wasip2()
instance = linker.instantiate(store, comp)

# Typed exports, callable straight from Python — no pointers, no glue:
#   sum:   func(values: list<f64>) -> f64
#   greet: func(name: string) -> string
sum_func = instance.get_func(store, "sum")
greet_func = instance.get_func(store, "greet")

total = sum_func(store, [1.5, 2.5, -4.0, 10.0])
assert total == 10.0, f"sum mismatch: {total}"

greeting = greet_func(store, "Ayşe")
assert greeting == "Hello, Ayşe! This component speaks WIT.", greeting

print("Example 12 (Python component host) — all assertions passed ✓")
print(f"  sum([1.5, 2.5, -4.0, 10.0]) = {total}")
print(f"  greet('Ayşe') = {greeting}")
