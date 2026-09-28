;; Example 02 — arithmetic and the stack machine
;; Types: i32, i64, f32, f64 (and v128 — SIMD)
;; Follow the stack state in the comments on each line.

(module
  ;; (a + b) * 2
  (func (export "compute") (param $a i32) (param $b i32) (result i32)
    local.get $a          ;; [a]
    local.get $b          ;; [a, b]
    i32.add               ;; [a+b]
    i32.const 2           ;; [a+b, 2]
    i32.mul               ;; [(a+b)*2]
  )

  ;; Fahrenheit → Celsius: (f - 32) * 5/9
  (func (export "f2c") (param $f f64) (result f64)
    local.get $f
    f64.const 32
    f64.sub               ;; [f-32]
    f64.const 0.5555555555555556   ;; [f-32, 5/9]
    f64.mul               ;; [result]
  )

  ;; Absolute value (i64), using `if`
  (func (export "abs64") (param $x i64) (result i64)
    local.get $x
    i64.const 0
    i64.lt_s              ;; x < 0? → pushes i32 (0/1)
    if (result i64)
      local.get $x
      i64.const -1
      i64.mul
    else
      local.get $x
    end
  )
)
