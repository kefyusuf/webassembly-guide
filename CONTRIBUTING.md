# Contributing

Thanks for considering a contribution! This repository is a bilingual
(English → Turkish) WebAssembly learning guide with verified, runnable
examples. The notes below explain the conventions CI enforces.

## Repository layout

| Path | Purpose |
|---|---|
| `docs/en/` | English chapters — the **source of truth** |
| `docs/tr/` | Turkish mirror of the chapters (localized filenames, e.g. `01-wasm-nedir.md`) |
| `examples/NN-topic/` | Numbered, self-contained examples (01 → 18) |
| `bench/` | Cross-language benchmark |
| `scripts/` | Repo tooling (`check-links.mjs`, `render-docs.mjs`) |

## Documentation changes

1. Edit the English chapter first; keep the Turkish mirror in sync (same
   sections, Turkish filenames for `docs/tr/`).
2. Every relative markdown link must resolve — run:
   ```bash
   node scripts/check-links.mjs
   ```
   CI runs this too (heading anchors included).

## Adding an example

1. Pick the next number and a short kebab-case topic: `examples/19-foo-bar/`.
2. Include, as applicable:
   - `README.md` — what it teaches, prerequisites, how to run
   - `build.sh` — reproducible build (used verbatim by CI)
   - `test.mjs` (or equivalent) — asserts the artifact actually works
   - Manifests: `Cargo.toml` + **committed `Cargo.lock`**, or `package.json`
     + **committed `package-lock.json`**, or `go.mod`
3. Wire it into `.github/workflows/ci.yml` following the numbered-step
   pattern (and `pages.yml` if it should appear in the live demo).
4. Add it to the tables in `README.md`, `README.tr.md` and `examples/README.md`.

## Commits

Conventional Commits, enforced by example if not by hook:
`feat:`, `fix:`, `docs:`, `ci:`, `chore:` — with an optional scope
(`fix(ci): …`). Keep each commit buildable.

## CI expectations

PRs run the full matrix (ubuntu + windows): every example is built and its
test executed, the benchmark runs, and the link checker must pass. If your
example needs a platform-specific tool (e.g. Emscripten is Linux-only in CI),
gate the step with `if:` and say so in the example README.
