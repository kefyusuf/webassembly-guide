;; Example 04 — conditionals and loops: Fibonacci
;; Loops in Wasm: blocks + branch instructions.
;; `loop` re-executes when branched to; think "loop = while".

(module
  ;; fib(n): the n-th fibonacci number (iterative)
  (func (export "fib") (param $n i64) (result i64)
    (local $a i64) (local $b i64) (local $tmp i64) (local $i i64)

    ;; a=0, b=1, i=0
    i64.const 0
    local.set $a
    i64.const 1
    local.set $b
    i64.const 0
    local.set $i

    ;; while (i < n) { tmp=a; a=b; b=a+tmp; i++ }
    block
      loop
        local.get $i
        local.get $n
        i64.ge_s          ;; i >= n? leave the loop
        br_if 1           ;; 1 = branch to the outer block (exit)

        local.get $a
        local.set $tmp

        local.get $b
        local.set $a

        local.get $a
        local.get $tmp
        i64.add
        local.set $b

        local.get $i
        i64.const 1
        i64.add
        local.set $i

        br 0              ;; back to the top of the loop
      end
    end

    local.get $a          ;; result: leave on the stack
  )

  ;; Sum from 1 to n — an alternative block/br_if shape
  (func (export "sum") (param $n i32) (result i32)
    (local $t i32)
    block
      loop
        local.get $n
        i32.eqz
        br_if 1
        local.get $t
        local.get $n
        i32.add
        local.set $t
        local.get $n
        i32.const 1
        i32.sub
        local.set $n
        br 0
      end
    end
    local.get $t
  )
)
