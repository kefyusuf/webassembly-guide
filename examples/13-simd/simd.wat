;; Example 13 — SIMD: the same sum, scalar vs vectorized (v128)
;;
;; Both functions sum an i32 array living in linear memory (JS writes it).
;; `len` is the ELEMENT count and must be a multiple of 4.
;;   sum_scalar: one element per iteration (i32.load → i64 add)
;;   sum_simd:   four elements per iteration:
;;               v128.load → widen the 4×i32 lanes to i64 (extend_low/high)
;;               → two i64x2.add into a vector accumulator.
;; No overflow: accumulation happens in i64 lanes.
;;
;; Compile with wasm-tools (SIMD is standard since Wasm 2.0):
;;   wasm-tools parse simd.wat -o dist/simd.wasm

(module
  (memory (export "memory") 1)

  ;; --- scalar reference -------------------------------------------------------
  (func (export "sum_scalar") (param $ptr i32) (param $len i32) (result i64)
    (local $i i32) (local $acc i64)
    block
      loop
        local.get $i
        local.get $len
        i32.ge_s
        br_if 1
        local.get $acc
        local.get $ptr
        local.get $i
        i32.const 2
        i32.shl          ;; byte address = ptr + i*4
        i32.add
        i32.load
        i64.extend_i32_s
        i64.add
        local.set $acc
        local.get $i
        i32.const 1
        i32.add          ;; next element
        local.set $i
        br 0
      end
    end
    local.get $acc)

  ;; --- SIMD: 4 lanes per iteration ---------------------------------------------
  (func (export "sum_simd") (param $ptr i32) (param $len i32) (result i64)
    (local $i i32) (local $acc v128) (local $wide v128)
    block
      loop
        local.get $i
        local.get $len
        i32.ge_s
        br_if 1
        local.get $ptr
        local.get $i
        i32.const 2
        i32.shl          ;; byte address = ptr + i*4
        i32.add
        v128.load align=4
        local.set $wide
        ;; widen the 4×i32 lanes to 2×i64 each, add both halves into acc
        local.get $acc
        local.get $wide
        i64x2.extend_low_i32x4_s        ;; [a0, a1] as i64 lanes
        i64x2.add
        local.set $acc
        local.get $acc
        local.get $wide
        i64x2.extend_high_i32x4_s       ;; [a2, a3] as i64 lanes
        i64x2.add
        local.set $acc
        local.get $i
        i32.const 4
        i32.add          ;; 4 elements per iteration
        local.set $i
        br 0
      end
    end
    local.get $acc
    i64x2.extract_lane 0
    local.get $acc
    i64x2.extract_lane 1
    i64.add)
)
