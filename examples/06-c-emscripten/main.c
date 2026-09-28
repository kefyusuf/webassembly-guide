// Example 06 — C → WebAssembly (Emscripten)
//
// Emscripten is the SDK that compiles C/C++ to Wasm and ships POSIX-like
// libraries plus a JS bridge. It's the standard way to port existing C code
// to the web.
//
// Build:  ./build.sh   (requires the Emscripten SDK — see the README)

#include <emscripten/emscripten.h>
#include <stdio.h>
#include <stdint.h>

// EMSCRIPTEN_KEEPALIVE: prevents the optimizer from dropping the export
// (in plain C, functions unreachable from main can be eliminated)

EMSCRIPTEN_KEEPALIVE
int32_t add(int32_t a, int32_t b) {
    return a + b;
}

EMSCRIPTEN_KEEPALIVE
uint64_t fib(int n) {
    uint64_t a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        uint64_t t = a + b;
        a = b;
        b = t;
    }
    return a;
}

// Returning a string to JS: returns a char* living in the Emscripten heap.
// JS reads it with UTF8ToString().
EMSCRIPTEN_KEEPALIVE
const char* greet(void) {
    return "Hello, this text lives in C memory!";
}

// An image-processing-style example: double every uint8 in place (saturating).
// JS writes a Uint8Array, C processes it in place, JS reads it back — zero-copy.
EMSCRIPTEN_KEEPALIVE
void double_values(uint8_t* data, int len) {
    for (int i = 0; i < len; i++) {
        int v = data[i] * 2;
        data[i] = v > 255 ? 255 : (uint8_t)v;
    }
}

// main: runs on load when Emscripten generates an HTML shell.
int main(void) {
    printf("C/Wasm module loaded\n");
    return 0;
}
