// Example 04 — Go → WebAssembly (GOOS=js GOARCH=wasm)
//
// Go's official target can access the DOM and Web APIs through the "js"
// virtual package. This is a much higher-level bridge than Rust's raw
// target: the syscall/js package makes real DOM calls.
//
// Build:  GOOS=js GOARCH=wasm go build -o dist/main.wasm .
package main

import (
	"fmt"
	"os"
	"syscall/js"
)

func main() {
	// 1) Exported Go functions: bound to the JS global scope via js.Global().Set.
	js.Global().Set("goSum", js.FuncOf(goSum))
	js.Global().Set("goFib", js.FuncOf(goFib))

	// 2) Direct DOM access (what raw Wasm cannot do, the Go bridge can):
	document := js.Global().Get("document")
	if !document.IsUndefined() {
		body := document.Call("getElementById", "output")
		if !body.IsNull() && !body.IsUndefined() {
			body.Set("textContent", "Go/Wasm loaded — open the console.")
		}
	}

	// 3) Node (wasm_exec) and browsers differ: detect Node via
	//    process.versions.node — some browser embedders define a partial
	//    `process` shim (possibly with null fields!), so probe safely:
	//    syscall/js panics if you call Get() on a null value.
	inNode := false
	p := js.Global().Get("process")
	if p.Type() == js.TypeObject {
		v := p.Get("versions")
		if v.Type() == js.TypeObject && !v.Get("node").IsUndefined() {
			inNode = true
		}
	}

	if !inNode {
		// Browser: keep the runtime alive so exports stay callable.
		fmt.Println("Go WebAssembly ready: you can call goSum(6,7), goFib(30).")
		select {}
	}

	// Node: self-test and exit cleanly.
	fmt.Println("== Go → Wasm ==")
	fmt.Println("goSum(6, 7) =", goSumCall(6, 7))
	fmt.Println("goFib(30) =", goFibCall(30))
	fmt.Println("goFib(50) =", goFibCall(50))

	os.Exit(0)
}

// goSum is called from JS as: goSum(6, 7)
func goSum(_ js.Value, args []js.Value) any {
	return args[0].Int() + args[1].Int()
}

// goFib(30) → 832040
func goFib(_ js.Value, args []js.Value) any {
	n := args[0].Int()
	a, b := uint64(0), uint64(1)
	for i := 0; i < n; i++ {
		a, b = b, a+b
	}
	return a
}

// --- Wrappers so the JS callbacks can be used like plain Go functions ---
func goSumCall(a, b int) int {
	return js.Global().Get("goSum").Invoke(a, b).Int()
}

func goFibCall(n int) uint64 {
	return uint64(js.Global().Get("goFib").Invoke(n).Int())
}
