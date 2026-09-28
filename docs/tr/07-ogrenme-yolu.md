# 7. Öğrenme Yolu

## Aşama 0 — Ön koşullar

- Temel JavaScript (tarayıcı yolu için) veya temel sistem bilgisi (sunucu yolu için)
- En az bir derlenmiş dil (C, C++, Rust, Go…) temelleri

## Aşama 1 — Kavramlar (1 hafta)

1. [01 — Wasm nedir](01-wasm-nedir.md) ve [02 — Nasıl çalışır](02-nasil-calisir.md) okuyun.
2. Tarayıcı DevTools'ta bir `.wasm` dosyasını inceleyin: herhangi bir Wasm kullanan siteyi açın → Sources/Debugger panelinde `.wasm` bölümü.
3. [examples/08-node-demo](../../examples/08-node-demo/) çalıştırın: sıfır kurulumla `WebAssembly` API'sini görün.

## Aşama 2 — WAT ile derinlere inin (1 hafta)

4. [examples/01-wat-basics](../../examples/01-wat-basics/) — elle WAT yazın, `wat2wasm` ile derleyin, `wasm2wat` ile geri okuyun.
5. MDN'in [metin format anlatımı](https://developer.mozilla.org/docs/WebAssembly/Understanding_the_text_format) ile birlikte yapın.

## Aşama 3 — İlk dilinizi bağlayın (1–2 hafta)

6. **Rust yolu (önerilen):** [examples/02-rust-web](../../examples/02-rust-web/) — wasm-bindgen ile string döndürme, struct paylaşma.
7. **Go yolu:** [examples/04-go-wasm](../../examples/04-go-wasm/).
8. **JS ekibiyseniz:** [examples/05-assemblyscript](../../examples/05-assemblyscript/).

## Aşama 4 — Tarayıcı dışı dünya (2 hafta)

9. [examples/03-rust-wasi](../../examples/03-rust-wasi/) — dosya, saat, env değişkenleri.
10. wasmtime kurun (`cargo install wasmtime-cli` veya [paket yöneticisi](https://docs.wasmtime.dev/)) ve aynı modülü tarayıcı dışında çalıştırın.
11. [06 — Ekosistem](06-ekosistem.md) bölümünde Component Model'i okuyun; isterseniz `wasm-tools` ile bir component derleyin.

## Aşama 5 — Gerçek proje (bir ay)

Seçenekler:
- Tarayıcıda bir **görüntü filtre/editör** (Rust + canvas) — SIMD deneyin.
- Bir **serverless API** (Rust + Spin/Fermyon veya wasmtime tabanlı servis).
- Mevcut bir C kütüphanesini **web'e taşıyın** (Emscripten) — en öğretici egzersiz.

## Seviye göstergeleri

| Seviye | Yapabildiğiniz şey |
|---|---|
| Başlangıç | WAT okur, tarayıcıda modül yükler, export çağırır |
| Orta | Bir dilden modül derler, bellek yönetimi yapar, performans ölçer |
| İleri | Component Model ile dil-bağlantısız sistem kurar, host fonksiyonları tasarlar |
| Uzman | Derleyici arka ucu / runtime optimizasyonu, WASI spesifikasyon katkısı |

## Sık yapılan hatalar

1. **UI'ı Wasm'a yazmaya çalışmak** — köprü overhead'i yüzünden JS'ten yavaş olabilir.
2. **Köprü çağrılarını döngü içinde yapmak** — binlerce küçük çağrı yerine tek büyük çağrı (batch) yapın.
3. **Belleği kopyalayarak aktarmak** — `Memory.buffer`'ı paylaşılan görünüm olarak kullanın, gereksiz kopyalamayın.
4. **Boyutu ölçmeden zincir seçmek** — Go/Blazor çıktısı mobil için ağır olabilir.
5. **Debugging stratejisi olmadan üretime çıkmak** — `console.error` + wasm-bindgen panik hook'ları + source map planlayın.
