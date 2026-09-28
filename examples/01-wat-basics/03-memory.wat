;; Example 03 — linear memory
;; Memory is paged (1 page = 64 KiB).
;; JS can read the very same bytes through a Uint8Array — without copying!

(module
  ;; Define 1 page (64 KiB) of memory and export it
  (memory (export "memory") 1)

  ;; Write a 4-byte i32 at an address (little-endian)
  (func (export "i32_write") (param $addr i32) (param $value i32)
    local.get $addr
    local.get $value
    i32.store)

  ;; Read an i32 from an address
  (func (export "i32_read") (param $addr i32) (result i32)
    local.get $addr
    i32.load)

  ;; Write a single byte
  (func (export "byte_write") (param $addr i32) (param $value i32)
    local.get $addr
    local.get $value
    i32.store8)

  ;; Static data: 42 at address 0 (baked in at compile time)
  (data (i32.const 0) "\2a\00\00\00")
)
