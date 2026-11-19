# Example 20 — wasm-bindgen-futures: Async Rust ⇄ JS Promises over WebSocket

WebSocket is a **JS API** — open, send and message are all event callbacks,
not syscalls. This example shows how `wasm-bindgen-futures` wraps those
callbacks into Rust futures so a wasm client reads like ordinary async Rust,
and how exported `async fn`s come back to JS as real promises.

## What it does

The module (web target, Node 26+ or browser) exports two promises:

- **`echo_roundtrip(url, message)`** — a full WebSocket conversation in one
  async function: connect → await `open` → send → await the first `message`
  → return the echoed text. `js_sys::Promise::new` wraps the `onopen` /
  `onerror` / `onmessage` callbacks; `JsFuture::from(promise).await` turns
  them back into Rust.
- **`delay(ms)`** — awaits a host-side `setTimeout` promise. The smallest
  possible proof that a Rust `async fn` suspends on the JS event loop and
  resumes when JS says so.

`test.mjs` runs a **real WebSocket echo server** (`ws` dev-dependency) and
drives the module through Node 26's native WebSocket global:

```
✓ echo_roundtrip → "ping-from-wasm" (connect ⇢ open awaited ⇢ send ⇢ message awaited)
✓ delay(150) suspended on the JS event loop for 163 ms
✓ a refused connection rejects the exported promise (Rust Err → JS rejection)
```

The failure-mode assertion matters: a Rust `Err` becomes a **JS rejection** —
`await` throws, exactly like a native promise.

## The pieces

| Piece | Version | Role |
|---|---|---|
| `wasm-bindgen` | **=0.2.130** (CLI must match exactly — see example 14) | exports |
| `wasm-bindgen-futures` | 0.4.80 | async fn ⇄ promise bridge, `JsFuture` |
| `js-sys` / `web-sys` | 0.3 | `Promise`, `Reflect`, `WebSocket`, events |
| Node | 26+ | native `WebSocket` global (client side) |
| `ws` (dev) | ^8.18 | the test's echo server |

```bash
npm install        # echo-server dev-dependency
bash build.sh      # cargo build + pinned wasm-bindgen CLI → dist/
node test.mjs
```

## Key lessons

- **Exported `async fn` = JS promise.** `pub async fn echo_roundtrip(...)`
  is awaited from JS with plain `await` — including rejections: returning
  `Err(JsValue)` rejects the promise.
- **JS promises are Rust futures.** `JsFuture::from(js_promise).await`
  suspends the Rust task on the JS event loop; the wasm does not block or
  spin while waiting for the network or a timer.
- **Callbacks in, future out.** The idiomatic pattern for event-style JS
  APIs: `Promise::new(&mut |resolve, reject| { set handlers; })` then
  `JsFuture::from(...).await`. Handler closures are moved into JS with
  `into_js_value()` so they outlive the Rust stack frame.
- **Glue keeps Rust names.** The web-target glue exports `echo_roundtrip`
  verbatim (not camelCase) — the JS side calls `echo_roundtrip(...)`.
- **This is example 16's missing half.** Example 16 showed async *around* a
  synchronous core with Node workers; example 19 showed WASI 0.3 async on
  the server side; this one is the browser-side bridge — the "real app"
  ingredient for anything networked (chat, dashboards, multiplayer).

## Watch out for

- No live demo: GitHub Pages is static — there is no WebSocket server to
  connect to. The CI test runs the full client against a local echo server;
  browsers can point `echo_roundtrip` at any `ws://` URL you control.
- Node needs the module **as bytes** (`init({ module_or_path: bytes })`) —
  the glue's default loader uses `fetch`, which cannot read `file://`.
- `WebSocket::new` resolves against the *global* constructor — that's why
  Node 26's native `WebSocket` makes this testable without a browser.
- Keep the `wasm-bindgen` crate and CLI versions locked (the exact-match
  pin in `build.sh` — the same trap as example 14).
