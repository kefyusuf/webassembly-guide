# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Dependabot configuration covering npm, cargo, gomod, Docker and
  GitHub Actions manifests (`.github/dependabot.yml`)
- Workflow-level least-privilege `permissions` block in the CI workflow
- `CONTRIBUTING.md` with repository conventions
- This changelog

### Fixed

- LICENSE now names the copyright holder

## [1.0.0] — 2026-09-28

### Added

- Seven documentation chapters in English and Turkish (`docs/en/`, `docs/tr/`)
- 18 worked, CI-verified examples across WAT, Rust (web, WASI, Component
  Model, wasm-bindgen, threads, async, wasm-pack), Go, C/Emscripten,
  AssemblyScript, Python (wasmtime-py + Pyodide), C#/Blazor, WasmGC, SIMD
  and JSPI
- Cross-language fib benchmark (`bench/`)
- CI matrix (ubuntu + windows) building and testing the examples, plus a
  markdown link checker (`scripts/check-links.mjs`)
- Docker image running the WASI example under wasmtime (FROM scratch runtime)
- GitHub Pages deployment with live browser demos (07-web-demo, 18-jspi)

[Unreleased]: https://github.com/kefyusuf/webassembly-guide/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/kefyusuf/webassembly-guide/releases/tag/v1.0.0
