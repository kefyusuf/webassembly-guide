# 6. Ekosistem: WASI, Wasm 3.0, Component Model ve Runtime'lar

## WebAssembly 3.0 (2025, W3C standardı)

Tek pakette standartlaşan başlıca özellikler:

- **WasmGC** — struct/array tipleri + tarayıcı GC entegrasyonu (Java, Kotlin, Dart hedeflerini mümkün kılar).
- **64-bit bellek (memory64)** — 4 GiB üstü bellek.
- **Çoklu bellek (multi-memory)** — bir modül birden fazla lineer bellek kullanabilir.
- **Taşınabilir SIMD (fixed-width SIMD)** — `v128` komutları; medya/kripto iş yüklerinde 4–8x hızlanma (bu deponun bellek-bound toplaması 2,7x ölçtü — bkz. [examples/13-simd](../../examples/13-simd/)).
- **Relaxed SIMD** — donanım varyasyonundan faydalanan SIMD.
- **Tail call** — derleyiciler için önemli.
- **Exception handling** — dil istisnalarının Wasm seviyesinde taşınması.
- **Reference types + typed function references** — daha verimli köprüler.
- **Multiple results** — fonksiyonlar birden çok değer döndürebilir.

## WASI (WebAssembly System Interface)

Tarayıcı dışı dünyada modüllerin sistem kaynaklarına **standart ve yetki tabanlı** erişimini tanımlar. POSIX'in "Wasm versiyonu" gibi düşünün, ama izinler açıkça verilir:

```
wasmtime run --dir=./veri program.wasm     # yalnızca ./veri klasörüne erişim
wasmtime run program.wasm                  # hiçbir dosya erişimi yok
```

- **WASI 0.2** (2024) — Component Model üzerine kurulu; soketler, önizleme düzeyinde ağ.
- **WASI 0.3** (2025–2026) — **native async I/O** (async/await komutları), önizleme ağ yığını; sunucu tarafı üretim kullanımını ciddi biçimde olgunlaştırdı.

## Component Model

Kaba Wasm modülleri yalnızca sayı tipleri konuşur; string'ler, nesneler, arabirimler yoktur. **Component Model**, bunun üstüne bir arabirim katmanı ekler:

- WIT (WebAssembly Interface Types) ile **arabirim tanımı** (IDL — protobuf'a benzer):

```wit
package demo:hesap;

world hesaplayici {
  export toplam: func(sayilar: list<f64>) -> f64;
}
```

- Farklı dillerde yazılmış component'ler **ortak arabirim üzerinden birbirini çağırabilir** (Rust component, Python component'i çağırabilir).
- "NPM'in Wasm versiyonu" vizyonu: dil bağımsız, güvenli paket ekosistemi.

```bash
# bileşen derleme akışı (Rust örneği)
cargo build --target wasm32-wasip2          # core module
wasm-tools component new modul.wasm -o bilesen.wasm
```

## Çalışma zamanları (runtimes)

| Runtime | Arkası | Öne çıkan |
|---|---|---|
| **wasmtime** | Bytecode Alliance (Mozilla, Fastly, Intel…) | Cranelift JIT; güvenlik odaklı; en yaygın referans runtime; .NET/Python/C bağlayıcıları |
| **Wasmer** | Wasmer Inc. | Çoklu arka uç (LLVM/Cranelift/Singlepass); WASIX; tüm platformlar |
| **WasmEdge** | CNCF | Linux基金会; Gömülü/IoT ve bulut odaklı, K8s entegrasyonları |
| **V8** | Google | Tarayıcılarda + Node.js + Cloudflare Workers |
| **JavaScriptCore** | Apple | Safari |
| **SpiderMonkey** | Mozilla | Firefox |

Node.js'in kendisi de V8 sayesinde Wasm çalıştırır — ek kurulum gerekmez (bkz. [examples/08-node-demo](../../examples/08-node-demo/)).

## Araçlar

| Araç | Ne yapar? |
|---|---|
| `wasm-pack` | Rust→web paketleme (npm paketi üretir) |
| `wasm-bindgen` | Rust↔JS köprüsü (yüksek seviye) |
| `wasm-tools` | Component model araç seti |
| WABT (`wat2wasm`, `wasm2wat`, `wasm-objdump`) | Düşük seviye inceleme/dönüştürme |
| `wasm-opt` (Binaryen) | Optimizasyon + küçültme |
| `wasm-decompile` | Wasm'ı sahte-C'ye geri dönüştürme (anlamaya yardımcı) |
| Emscripten SDK (`emcc`) | C/C++ SDK |
| `wasmprinter`, `wasm-gc` | İnceleme ve boyut küçültme |

## Çerçeveler ve platformlar

- **Tarayıcı framework'leri:** React/Vue/Svelte normalden kullanabilir; Rust tarafında **Leptos**, **Yew**, **Dioxus** — tamamen Wasm ile UI yazmayı deneyen framework'ler (UI'ı JS'e bırakmayan yaklaşım; hâlâ gelişmekte).
- **wasmCloud, Spin, Fermyon Cloud** — Wasm-native uygulama platformları.
- **runwasi** — Kubernetes'te Wasm pod'ları çalıştırma (containerd shim).
- **Extism** — her dile eklenti sistemi ekleyen kütüphane (host = istediğiniz dil, plugin = istediğiniz dil).

## Öğrenme kaynakları

- [webassembly.org](https://webassembly.org/) — resmî site ve yol haritası
- [MDN WebAssembly](https://developer.mozilla.org/docs/WebAssembly) — en iyi API referansı
- [WASI dev listesi](https://wasi.dev/) — spesifikasyonlar
- [Component Model book](https://component-model.bytecodealliance.org/)
- [Wasmtime kitabı](https://docs.wasmtime.dev/)
- [MDN: Understanding WebAssembly text format](https://developer.mozilla.org/docs/WebAssembly/Understanding_the_text_format)
- [Awesome Wasm](https://github.com/mbasso/awesome-wasm) — kapsamlı bağlantı listesi
- [WABT](https://github.com/WebAssembly/wabt) — metin↔ikili araçları
