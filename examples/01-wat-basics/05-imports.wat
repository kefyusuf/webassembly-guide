;; Example 05 — imports: pulling functions in from JS
;; Wasm runs isolated; imports/exports are how it talks to the outside.
;; This module calls a "log" function provided by the host (JS).

(module
  ;; import: we expect the host to provide "env.log"
  (import "env" "log" (func $log (param i32)))

  ;; an export wrapping the imported function
  (func (export "log_it") (param $x i32)
    local.get $x
    call $log)

  ;; log 1..5
  (func (export "log_to_five")
    (local $i i32)
    block
      loop
        local.get $i
        i32.const 5
        i32.gt_s
        br_if 1
        local.get $i
        call $log
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br 0
      end
    end)
)
