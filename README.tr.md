# WebAssembly (Wasm) — Kapsamlı Bilgilendirme Deposu (Türkçe)

> Bu depo İngilizce öncelikli olarak yapılandırılmıştır; aşağıda Türkçe kaynaklara yönlendirmeler bulacaksınız.

🌍 **Dil / Language:** [English](README.md) · **Türkçe**

[![CI](https://github.com/kefyusuf/webassembly-guide/actions/workflows/ci.yml/badge.svg)](https://github.com/kefyusuf/webassembly-guide/actions/workflows/ci.yml)

---

## 📚 Türkçe Dokümantasyon

| Doküman | Konu |
|---|---|
| [docs/tr/01-wasm-nedir.md](docs/tr/01-wasm-nedir.md) | WebAssembly nedir, tarihçe, hedefleri, JS ile ilişkisi |
| [docs/tr/02-nasil-calisir.md](docs/tr/02-nasil-calisir.md) | İkili format, stack makinesi, WAT sözdizimi, JS köprüsü, bellek modeli |
| [docs/tr/03-diller-ve-araclar.md](docs/tr/03-diller-ve-araclar.md) | Hangi diller Wasm'a derlenebilir? Hangisi ne zaman seçilmeli? |
| [docs/tr/04-avantaj-dezavantaj.md](docs/tr/04-avantaj-dezavantaj.md) | Avantajlar, dezavantajlar, ne zaman **kullanmamalı**? |
| [docs/tr/05-sektorel-kullanim.md](docs/tr/05-sektorel-kullanim.md) | Sektörel kullanım: Figma, Photoshop, AutoCAD, oyun, bulut, blokzincir, edge… |
| [docs/tr/06-ekosistem.md](docs/tr/06-ekosistem.md) | WASI, Wasm 3.0, Component Model, runtime'lar, araç ekosistemi |
| [docs/tr/07-ogrenme-yolu.md](docs/tr/07-ogrenme-yolu.md) | Adım adım öğrenme yolu + kaynakça |

## 🧪 Örnekler

| # | Klasör | Dil | Ne öğretir? |
|---|---|---|---|
| 01 | [examples/01-wat-basics](examples/01-wat-basics/) | WAT (metin formatı) | Wasm'ın derinliğine, elle yazılmış modüller |
| 02 | [examples/02-rust-web](examples/02-rust-web/) | Rust | Tarayıcı hedefi, JS↔Rust veri alışverişi |
| 03 | [examples/03-rust-wasi](examples/03-rust-wasi/) | Rust | Tarayıcı dışı (WASI) hedefi — dosya, saat, ortam değişkeni |
| 04 | [examples/04-go-wasm](examples/04-go-wasm/) | Go | `GOOS=js GOARCH=wasm`, doğrudan DOM erişimi |
| 05 | [examples/05-assemblyscript](examples/05-assemblyscript/) | AssemblyScript | TypeScript benzeri sözdizimiyle sıfırdan Wasm |
| 06 | [examples/06-c-emscripten](examples/06-c-emscripten/) | C | Emscripten ile C→Wasm (mevcut C kodunu web'e taşıma) |
| 07 | [examples/07-web-demo](examples/07-web-demo/) | HTML/JS | Tüm modülleri tarayıcıda tek sayfada çalıştıran demo |
| 08 | [examples/08-node-demo](examples/08-node-demo/) | Node.js | Sunucu tarafında `WebAssembly` API'sinin doğrudan kullanımı |
| 09 | [examples/09-python-wasm](examples/09-python-wasm/) | Python | İki yön: Python→Wasm **çalıştırıcı** (wasmtime-py) ve Wasm içinde Python (Pyodide) |
| 10 | [examples/10-csharp-blazor](examples/10-csharp-blazor/) | C# | .NET ekosisteminde Blazor WebAssembly ve Native AOT |

Örneklerin hepsi derlenip test edildi (06'nın derlemesi Emscripten SDK gerektirir).

---

## ⚡ 60 Saniyelik Özet

**WebAssembly (kısaltması Wasm)**, C, C++, Rust, Go gibi dillerden derlenebilen, taşınabilir bir **ikili komut formatıdır**. Tarayıcıda JavaScript'in yanında yaklaşık native hızda çalışır; günümüzde tarayıcının dışında da — sunucularda, edge fonksiyonlarında, IoT'de — güvenli bir "sanal makine" olarak kullanılır.

- **Ne değildir?** JavaScript'in yerine geçmez; JS ile birlikte çalışır (Wasm DOM'a doğrudan erişemez).
- **Neden var?** Tarayıcıya performanslı ve güvenli kod taşımak için doğdu; bugün bulut/edge tarafına da taşındı.
- **Kimler kullanıyor?** Figma, Google Earth, Photoshop for Web, AutoCAD, Unity, Cloudflare Workers, Fastly, Shopify Functions, Ethereum/Polkadot istemcileri…
- **Standart durumu (2026):** [WebAssembly 3.0](https://www.w3.org/2025/09/pressrelease-wasm-rec.html.tr) 2025'te W3C standardı oldu (GC, SIMD, memory64 dahil); WASI 0.3 native async I/O getirerek sunucu tarafını olgunlaştırdı.

---

## 🧩 Wasm'ın Üç Kişiliği

1. **Tarayıcıda hız motoru:** ağır hesap, oyun motorları, görüntü/video işleme, CAD, kod derleyicileri.
2. **Plugin/uzantı sanal makinesi:** ana uygulamanın güvenli eklenti çalışma ortamı.
3. **Bulut/edge çalışma birimi:** soğuk başlama süresi ~0 olan, mikrosaniyelerle izole edilen serverless fonksiyonlar.

---

## 🚀 Hızlı Başlangıç

```bash
# Node.js yüklüyse: Node demosu hemen çalışır (kurulum gerekmez)
cd examples/08-node-demo && node run.mjs

# Tarayıcı demosu için: örnekleri derleyin (examples/README.md)
```

---

## 📄 Lisans

MIT — bkz. [LICENSE](LICENSE).
