;; Example 01 — the smallest module
;; A module built from one exported function.
;; The value on top of the stack before the end is the return value.

(module
  ;; $hello: a function returning 42
  (func $hello (result i32)
    i32.const 42)

  ;; Expose the function
  (export "hello" (func $hello))

  ;; Example of chaining two functions:
  ;; a helper + an export that uses it
  (func $add_two (param $x i32) (result i32)
    local.get $x
    i32.const 2
    i32.add)

  (func (export "hello_plus_2") (result i32)
    call $hello
    call $add_two)
)
