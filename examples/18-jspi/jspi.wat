;; Example 18 — JSPI: a synchronous wasm call site that awaits JS promises.
;;
;; `get_value` has a completely ordinary sync signature (i32)->i32.
;; The JS host wraps it in `new WebAssembly.Suspending(...)` so it may
;; return a Promise; wasm suspends while it resolves. The export is wrapped
;; with `new WebAssembly.promising(...)` so calling it from JS yields a
;; Promise instead of blocking.
;; The wasm source is 100% synchronous — no async ABI, no polling.
;;
;; Compile: wasm-tools parse jspi.wat -o dist/jspi.wasm
;; JSPI: default in Node 26+/Chrome 137+; behind flags in older runtimes.

(module
  (import "env" "get_value" (func $get (param i32) (result i32)))

  ;; Two suspending calls — wasm execution pauses inside each, the JS event
  ;; loop runs, then execution resumes exactly where it stopped.
  (func (export "run") (result i32)
    (call $get (i32.const 10))
    (call $get (i32.const 20))
    i32.add)
)
