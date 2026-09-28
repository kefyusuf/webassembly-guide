// Example 12 — the Component Model: a real wasm32-wasip2 component.
//
// Unlike the raw Rust example (02), here the module's public interface is
// defined in **WIT** (WebAssembly Interface Types) — strings and lists cross
// the boundary natively, no pointers/lengths, and the build output is a
// *component* (a core module + a typed interface wrapper).
//
// Build:  ./build.sh   (cargo --target wasm32-wasip2)

// Generate Rust bindings from wit/calculator.wit
wit_bindgen::generate!({
    path: "wit",
    world: "calculator",
});

/// The implementation of the WIT world's exports.
struct Calculator;

impl Guest for Calculator {
    /// WIT `sum: func(values: list<f64>) -> f64`
    /// — a Vec<f64> crosses the boundary with zero manual serialization.
    fn sum(values: Vec<f64>) -> f64 {
        values.iter().sum()
    }

    /// WIT `greet: func(name: string) -> string`
    /// — a real string, not a pointer + length pair.
    fn greet(name: String) -> String {
        format!("Hello, {name}! This component speaks WIT.")
    }
}

export!(Calculator);
