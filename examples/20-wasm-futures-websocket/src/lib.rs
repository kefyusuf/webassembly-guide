// Example 20 — wasm-bindgen-futures: async Rust ⇄ JS promises, driving a
// real WebSocket client. In the browser (and Node 26+, which has a native
// WebSocket global), WebSocket is a JS API — every open/send/message is an
// event-callback API. The wasm-bindgen-futures layer wraps those callbacks
// into Rust futures, so the guest code reads like ordinary async Rust:
//
//     let ws = WebSocket::new(&url)?;
//     opened().await;
//     ws.send_with_str(&message)?;
//     let echoed = message_event().await;
//
// Exports: `echo_roundtrip(url, message)` (open → send → await reply) and
// `delay(ms)` (await a JS setTimeout promise — the tiniest JsFuture demo).

use js_sys::{Promise, Reflect};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{MessageEvent, WebSocket};

/// Await a host-side `setTimeout(ms)` promise — the smallest demonstration
/// that a Rust `async fn` can suspend on the JS event loop and resume when
/// the promise resolves. Runs in browsers and Node 26+ alike.
#[wasm_bindgen]
pub async fn delay(ms: u32) -> Result<(), JsValue> {
    let global = js_sys::global();
    let set_timeout = Reflect::get(&global, &JsValue::from_str("setTimeout"))?
        .unchecked_into::<js_sys::Function>();

    let fired = Promise::new(&mut |resolve: js_sys::Function, _reject| {
        let _ = set_timeout.call2(&global, resolve.as_ref(), &JsValue::from(ms));
    });
    JsFuture::from(fired).await?;
    Ok(())
}

/// A full WebSocket round trip in async Rust: connect, await `open`, send,
/// await the first `message` event, return the echoed text. The event
/// callbacks are wrapped as promises with `js_sys::Promise::new`, so the
/// whole conversation is a single `async fn` — no callback pyramid.
#[wasm_bindgen]
pub async fn echo_roundtrip(url: String, message: String) -> Result<String, JsValue> {
    let ws = WebSocket::new(&url)?;

    // open → resolve; error → reject. The handler closures are moved into
    // JS (into_js_value) so they stay alive as long as the handlers do.
    let opened = Promise::new(&mut |resolve: js_sys::Function, reject: js_sys::Function| {
        let ws_for_open = ws.clone();
        let ws_for_err = ws.clone();
        let ws_err_close = ws.clone();

        let on_open = Closure::<dyn FnMut()>::new(move || {
            resolve.call0(&JsValue::NULL).unwrap();
        });
        let open_fn = on_open.into_js_value().unchecked_into::<js_sys::Function>();
        ws_for_open.set_onopen(Some(&open_fn));

        let on_err = Closure::<dyn FnMut(web_sys::ErrorEvent)>::new(move |e: web_sys::ErrorEvent| {
            let _ = ws_err_close.close();
            reject.call1(&JsValue::NULL, &e.message().into()).unwrap();
        });
        let err_fn = on_err.into_js_value().unchecked_into::<js_sys::Function>();
        ws_for_err.set_onerror(Some(&err_fn));
    });
    JsFuture::from(opened).await?;

    ws.send_with_str(&message)?;

    let received = Promise::new(&mut |resolve: js_sys::Function, _reject| {
        let on_message = Closure::<dyn FnMut(MessageEvent)>::new(move |e: MessageEvent| {
            resolve.call1(&JsValue::NULL, &e.data()).unwrap();
        });
        let msg_fn = on_message.into_js_value().unchecked_into::<js_sys::Function>();
        ws.set_onmessage(Some(&msg_fn));
    });
    let echoed = JsFuture::from(received).await?;

    ws.close()?;

    echoed
        .as_string()
        .ok_or_else(|| JsValue::from_str("expected a text message frame"))
}
