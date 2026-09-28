;; Example 11 — WasmGC: garbage-collected structs and arrays in raw WAT
;;
;; WebAssembly 3.0's GC feature adds struct and array types. The data lives
;; in the embedder's garbage-collected heap (the browser/Node GC) — this
;; module exports NO linear memory at all.
;;
;; Compile with wasm-tools (wabt does not support GC yet):
;;   wasm-tools parse gc.wat -o dist/gc.wasm

(module
  ;; A struct with one mutable and one immutable field
  (type $point (struct (field (mut i32)) (field i32)))
  ;; A mutable array of i32
  (type $buffer (array (mut i32)))

  ;; --- Structs ---------------------------------------------------------------

  (func (export "new_point") (param $x i32) (param $y i32) (result (ref $point))
    local.get $x
    local.get $y
    struct.new $point)

  (func (export "get_x") (param $p (ref $point)) (result i32)
    local.get $p
    struct.get $point 0)

  (func (export "get_y") (param $p (ref $point)) (result i32)
    local.get $p
    struct.get $point 1)

  (func (export "set_x") (param $p (ref $point)) (param $v i32)
    local.get $p
    local.get $v
    struct.set $point 0)

  ;; --- Arrays ------------------------------------------------------------------

  (func (export "new_buffer") (param $len i32) (param $init i32) (result (ref $buffer))
    local.get $init     ;; array.new takes the init value first,
    local.get $len      ;; then the length
    array.new $buffer)

  (func (export "buffer_get") (param $b (ref $buffer)) (param $i i32) (result i32)
    local.get $b
    local.get $i
    array.get $buffer)

  (func (export "buffer_set") (param $b (ref $buffer)) (param $i i32) (param $v i32)
    local.get $b
    local.get $i
    local.get $v
    array.set $buffer)

  (func (export "buffer_len") (param $b (ref $buffer)) (result i32)
    local.get $b
    array.len)

  ;; Sum the elements with a plain loop
  (func (export "buffer_sum") (param $b (ref $buffer)) (result i32)
    (local $i i32) (local $t i32)
    block
      loop
        local.get $i
        local.get $b
        array.len
        i32.ge_s
        br_if 1
        local.get $t
        local.get $b
        local.get $i
        array.get $buffer
        i32.add
        local.set $t
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br 0
      end
    end
    local.get $t)
)
