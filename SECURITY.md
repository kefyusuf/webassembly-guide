# Security Policy

This is an educational repository: every artifact is meant to be read and run
locally by learners. There is no production service, no secrets, and no
runtime surface beyond the GitHub Pages demo and the ghcr image.

## Supported versions

Only the latest `main` branch receives fixes. Tags (`v1.0.0`, `v1.1.0`, …)
are historical snapshots and are not patched retroactively.

## How to report a vulnerability

- Please **do not open a public issue** for anything that could be exploited.
- Use GitHub's private vulnerability reporting:
  **Security → Report a vulnerability** on
  <https://github.com/kefyusuf/webassembly-guide>, or contact the repository
  owner directly via GitHub.
- You will get an acknowledgment within a week and a follow-up when the issue
  is triaged.

## Scope notes

- The `Dockerfile`/ghcr image executes the Rust WASI example under wasmtime —
  reports about wasmtime itself belong upstream
  ([bytecodealliance/wasmtime](https://github.com/bytecodealliance/wasmtime)).
- The GitHub Pages demo runs compiled Wasm modules from this repository's
  examples in your browser; it fetches only same-origin assets.
- Dependency updates are handled by Dependabot; supply-chain concerns about
  pinned GitHub Actions (commit-SHA pins) are in scope here.
