# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] — 2026-11-19

### Added

- `.github/dependabot.yml` — weekly updates for npm, cargo, gomod, Docker
  and GitHub Actions manifests, with minor/patch grouping
- Community health files: `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1),
  `SECURITY.md`, YAML issue templates and a pull request template
- `CONTRIBUTING.md` documenting repository conventions
- This changelog (Keep a Changelog format, with retroactive 1.0.0/1.1.0
  entries)
- **Example 10 is now a real project**: a hand-minimized Blazor WebAssembly
  SPA (`BlazorExample/`, SDK-only, no AOT) with `build.sh` and a `test.mjs`
  that asserts both the .NET runtime and the app's C# assembly ship as
  actual `.wasm` modules (magic-byte check); built and tested in CI on
  ubuntu + windows
- Turkish documentation served on GitHub Pages (`docs/tr` → `/docs/tr/`)
  with a per-chapter EN⇄TR switch in the docs navigation
- `.editorconfig` for the multi-language tree

### Changed

- All GitHub Actions pinned to commit SHAs with version comments
  (Dependabot keeps them updated)
- CI now tests the Go floor declared in `go.mod` (1.21) instead of 1.22
- Pages index template moved from `.github/` to `scripts/templates/`

### Fixed

- LICENSE now names the copyright holder
- Stale wasm-bindgen version reference in `examples/README.md`

### Security

- Workflow-level least-privilege `permissions` block in the CI workflow
  (matching `pages.yml` and `docker.yml`)

## [1.1.0] — 2026-09-28

### Added

- 8 new examples (11–18): WasmGC, Component Model (WIT → wasm32-wasip2,
  with a Python wasmtime host), SIMD (measured scalar vs `v128` speedup),
  wasm-bindgen, threads (`wasi-threads`), async (worker_threads contrast),
  wasm-pack (full npm package lifecycle, verified without publishing) and
  JSPI (sync wasm awaiting JS promises)
- Live browser demo extended: WasmGC and SIMD modules in 07-web-demo, a
  dedicated JSPI demo, and rendered documentation served on GitHub Pages
- Docker image publishing to ghcr (wasmtime runtime, `FROM scratch`)
- CI hardened: windows-latest added to the build matrix, Node 26, and a
  markdown link checker run on every push

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

[Unreleased]: https://github.com/kefyusuf/webassembly-guide/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/kefyusuf/webassembly-guide/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/kefyusuf/webassembly-guide/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/kefyusuf/webassembly-guide/releases/tag/v1.0.0
