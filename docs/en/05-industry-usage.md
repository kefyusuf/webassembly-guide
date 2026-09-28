# 5. Industry Usage: Who, Where, and Why

How Wasm is used in the real world, sector by sector.

## 🎨 Design and creative software

- **Figma** — the pioneer. It ported its C++ rendering engine to the web via Emscripten; Wasm's enterprise adoption accelerated in its wake. Today Figma also runs multi-user editing synchronization computation in Wasm.
- **Photoshop for Web** — Adobe ported ~15+ million lines of C++ to the browser with Emscripten/Wasm (using WASM SIMD + Threads).
- **AutoCAD Web** — Autodesk's browser version of its CAD engine.
- **Google Earth** — the 3D globe rendering running in the browser via Wasm.

## 🧮 Office and data products

- **Google Sheets** — Java+WasmGC experiments: prototypes running the computation engine in the browser via Wasm.
- **Microsoft Excel** — support for functions distributed as Wasm modules (Excel Labs Wasm functions).
- **SQLite** — the official SQLite Wasm build; a database in the browser (with OPFS persistence).

## 🎮 Gaming

- **Unity** — the WebGL/WebGPU export backend is Wasm-based.
- **Unreal Engine** — Wasm-based web streaming efforts as the successor of HTML5 export.
- **Godot** — the editor itself compiled to Wasm (editor in the browser) plus a web export target.
- **ebiten, Bevy** — Rust game engines targeting Wasm; 60 FPS in the browser.

## ☁️ Cloud / serverless / edge

This is the engine of Wasm's out-of-browser growth:

| Platform | Usage |
|---|---|
| **Cloudflare Workers** | Wasm support alongside V8 isolates; image/video transformation pipelines run in Wasm |
| **Fastly Compute (Compute@Edge)** | Programs compiled from Rust/Go run at CDN edge sites worldwide |
| **Microsoft Hyperlight** | Hybrid Wasm + micro-VM function execution |
| **wasmCloud** | A CNCF project; building distributed apps from Wasm components |
| **Spin (Fermyon)** | A Wasm-based serverless framework |
| **Suborbital (Sat)** | Running user-supplied plugin code in a Wasm sandbox |

The commercial rationale: **multi-tenant isolation**. Instead of ~100 MB RAM and seconds per container, KBs and microseconds per Wasm module — often an order of magnitude more customer density on the same hardware.

## 🌐 Network infrastructure and databases (plugin architectures)

- **Envoy Proxy** — extending proxies with Wasm filter plugins (the official "Wasm filter" API; similar approaches in Nginx-class servers).
- **Shopify Functions** — merchants write checkout logic (discounts, shipping, payment rules) in Rust/Go; it runs in a Wasm sandbox: **extension security without ever granting arbitrary code execution**.
- **SQLite, PostgreSQL (experiments), Redpanda, Vector (Datadog)** — data-in-motion transformations as Wasm plugins.
- **CNCF**: Wasm is entering the Kubernetes ecosystem as a container alternative/supplement (runwasi, containerd-shim-wasmedge, etc.).

## ⛓️ Blockchain

- **Ethereum** — **EWASM** (Ethereum-flavored Wasm) as a contract target in research roadmaps; the **Polkadot** runtime is entirely Wasm.
- **CosmWasm** — smart contracts in the Cosmos ecosystem (Rust→Wasm).
- **NEAR Protocol** — contracts run as Wasm.
- Why: **deterministic execution** + **sandbox safety** + verifiability.

## 🔬 Science and data

- **JupyterLite** — a Pyodide-based Jupyter running entirely in the browser; Python/NumPy/Pandas with zero install.
- **Pyodide-based products** — in-browser data processing where the data never leaves the client (privacy win: healthcare, finance).
- **Bioinformatics/financial modeling** — reusing native C/Fortran code in the browser.

## 📱 Mobile and cross-platform

- **Kotlin Multiplatform (Kotlin/Wasm)** — one business logic for web + native.
- **Flutter (Dart WasmGC target)** — Wasm instead of JS for web builds.
- **Zaplib** — porting Rust desktop apps to the web (experimental but conceptually important).

## 🏢 Enterprise software and plugin safety

- **Microsoft 365 / Office add-ins** — Wasm functions (Excel Labs).
- **Red Hat / IBM** — serious investment in server-side Wasm (Codewind, Quarkus Wasm experiments).
- **1Password, Figma, Cloudflare** — moving security-critical computation into the Wasm sandbox.

## Summary of trends (as of 2026)

- Browser support: 97%+ global reach (all modern browsers, most Wasm 3.0 features).
- Server side: rapid adoption across the CNCF ecosystem; wasmtime has led "fastest Wasm runtime" benchmarks since 2023 (Bytecode Alliance).
- "WebAssembly" as a job keyword is growing, especially in cloud infrastructure and game/engine development roles.

> Note: sector facts are current as of September 2026; this space moves fast — verify fresh numbers at [webassembly.org/roadmap](https://webassembly.org/roadmap/) and the [Wasm Community Group](https://www.w3.org/community/webassembly/).
