// Verifies example 20: the async Rust client exports `echoRoundtrip` and
// `delay` as JS promises. The test runs a real WebSocket echo server
// (`ws` dev-dependency), drives the wasm module against it with Node 26's
// native WebSocket global, and measures that `delay` actually suspended on
// the JS event loop — the wasm-bindgen-futures bridge, end to end.
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

const here = path.dirname(fileURLToPath(import.meta.url));

let failed = 0;
const check = (ok, good, bad) => {
  console.log(`  ${ok ? "✓" : "✗"} ${ok ? good : bad}`);
  if (!ok) failed++;
};

// 1. A real echo server on an ephemeral port (the "other side" of the app)
const wss = new WebSocketServer({ port: 0 });
const port = wss.address().port;
wss.on("connection", (socket) => {
  socket.on("message", (data) => socket.send(data.toString()));
});

try {
  // 2. Load the wasm-bindgen glue; Node can't fetch file:// — pass the bytes
  const glueUrl = pathToFileURL(path.join(here, "dist", "wasm_futures_ws.js")).href;
  const glue = await import(glueUrl);
  const bytes = readFileSync(path.join(here, "dist", "wasm_futures_ws_bg.wasm"));
  await glue.default({ module_or_path: bytes });
  check(true, "glue loaded, module instantiated from bytes", "");

  // 3. Full WebSocket round trip through async Rust
  const echoed = await glue.echo_roundtrip(`ws://127.0.0.1:${port}`, "ping-from-wasm");
  check(echoed === "ping-from-wasm",
    `echo_roundtrip → "${echoed}" (connect ⇢ open awaited ⇢ send ⇢ message awaited)`,
    `expected the message echoed back, got: ${JSON.stringify(echoed)}`);

  // 4. delay() awaits a JS setTimeout promise — measure the suspension
  const t0 = performance.now();
  await glue.delay(150);
  const dt = performance.now() - t0;
  check(dt >= 140 && dt < 5000,
    `delay(150) suspended on the JS event loop for ${Math.round(dt)} ms`,
    `delay(150) took ${Math.round(dt)} ms — not a real event-loop suspension`);

  // 5. Error path: connecting nowhere rejects the Rust future as a JS error
  let rejected = false;
  try {
    await glue.echo_roundtrip(`ws://127.0.0.1:1/`, "x"); // port 1: connection refused
  } catch {
    rejected = true;
  }
  check(rejected,
    "a refused connection rejects the exported promise (Rust Err → JS rejection)",
    "expected a JS rejection for an unreachable server");
} finally {
  wss.close();
}

console.log(failed === 0
  ? "Example 20 (wasm-bindgen-futures + WebSocket) — all assertions passed ✓"
  : `Example 20 (wasm-bindgen-futures + WebSocket) — ${failed} assertion(s) failed ✗`);
if (failed > 0) process.exit(1);
