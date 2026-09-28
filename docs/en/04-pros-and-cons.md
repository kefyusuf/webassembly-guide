# 4. Advantages and Disadvantages

## ✅ Advantages

### 1. Performance
- Static types + compact binary format → JIT compilation is far more predictable and faster than JS.
- Typically **2–20×** faster than JS; **70–95%** of native speed depending on workload.
- No GC pauses, no deopts — no JIT "surprises" (unless you use WasmGC).

### 2. Safety and isolation
- **Sandbox is mandatory:** a module cannot touch any system resource (files, network, DOM…) unless explicitly granted.
- **Memory safe:** linear-memory bounds checks cannot be bypassed; even in C, a buffer overflow can't escape the sandbox (it traps safely).
- **Capability-based model:** permissions live in the runtime's granted imports, not in the code → a good fit for "run code you downloaded freely".

### 3. Portability
- One `.wasm` binary runs on x86/ARM, Windows/macOS/Linux, browser/server/IoT alike.
- "Compile once, run anywhere" — the JVM's promise at a lower level with stronger isolation.

### 4. Reusing existing code
- Port C/C++ libraries (codecs, physics engines, crypto, PDF…) to the web without rewriting.
- Reduces cross-platform duplication: the same core logic runs on web, desktop and mobile.

### 5. Small and fast to deploy (cloud side)
- **Orders of magnitude** smaller than a container image (KBs vs hundreds of MBs).
- Cold start in **microseconds** (containers: seconds) → ideal for serverless/edge.
- Memory footprint starts in kilobytes → far denser multi-tenancy on the same hardware.

### 6. Deterministic execution
- Low platform dependence; the same module behaves the same everywhere. Critical for blockchain and consensus systems.

## ❌ Disadvantages

### 1. No direct DOM access
- Every UI interaction crosses the JS bridge; the call overhead becomes a bottleneck in heavy DOM manipulation.
- **Consequence:** Wasm is for the compute layer, not the UI layer (working exceptions: architectures like Blazor that keep the whole UI in Wasm memory and paint with a minimal bridge).

### 2. Data exchange is laborious
- Strings/arrays/objects are serialized through linear memory; manual memory management outside the host GC may be required.
- Tools (wasm-bindgen, embind) help, but there's a learning cost.

### 3. Ecosystem and toolchain complexity
- An extra build step, cross-compilation issues, harder debugging. Source maps have improved, but it's still not as smooth as a native debugger.
- Stack traces can be hard to read.

### 4. It is NOT faster for everything
- For short, simple operations the JS↔Wasm bridge cost can eat the speed advantage. Rule: **minimize bridge calls, pass big work in batches.**
- For a typical DOM-centric web page, Wasm contributes ~nothing.

### 5. Binary size and first load (some toolchains)
- Targets that "ship the runtime" (Go official, Blazor, Pyodide) have multi-MB first downloads; noticeable on mobile.
- Rust/AssemblyScript/TinyGo are good when small output matters.

### 6. Standardization is moving, not finished
- Outside the browser, WASI is still evolving version by version (0.3 as of 2026) — the ecosystem is at the edge of standardization, not at maturity's peak.
- Threads, exception handling, async: browser support arrived at different paces per feature.

### 7. People and maintenance
- May require a team that knows Rust/C++; extra learning cost for JS teams.
- Two worlds (JS + Wasm) means two toolchains and two test strategies.

## 🎯 When to use it — and when not to

| Scenario | Is Wasm a fit? |
|---|---|
| 3D games, game engines | ✅ Yes |
| Video/audio editing, codecs | ✅ Yes |
| Image processing, crypto, compression (in browser) | ✅ Yes |
| Native libraries in the browser (FFmpeg, SQLite…) | ✅ Yes |
| Heavy computation / scientific simulation (in browser) | ✅ Yes |
| Porting existing C/C++ code to the web | ✅ Yes |
| Serverless/edge functions, plugin systems | ✅ Yes (WASI) |
| Typical CRUD web app | ❌ No — JS/TS suffices |
| Heavy DOM manipulation | ❌ No — bridge overhead |
| Small, static website | ❌ No |
| Simple interactive page where first load is critical | ❌ Probably not |

**One-sentence rule:** *The UI is JavaScript's job, the computation is Wasm's; outside the browser, think of Wasm as a secure, tiny, portable execution unit.*
