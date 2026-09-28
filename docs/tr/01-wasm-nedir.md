# 1. WebAssembly Nedir?

## Tanım

**WebAssembly (Wasm)**, modern tarayıcılarda ve tarayıcı dışındaki çalışma ortamlarında çalışan, **taşınabilir ikili (binary) komut formatıdır**. Bir programlama dili değil, bir **derleme hedefidir (compilation target)**: C, C++, Rust, Go gibi diller, normalde makine koduna derlenirken alternatif olarak Wasm'a derlenebilir.

Wasm kodu, **sandbox (kum havuzu) içinde izole** olarak çalışır ve **yaklaşık native (makine kodu) hızında** yürütülür. W3C tarafından standartlaştırılmıştır; tüm büyük tarayıcı üreticileri (Chrome, Firefox, Safari, Edge) ve şirketleri (Google, Microsoft, Mozilla, Apple) konsorsiyumda ortak çalışır.

```
Kaynak dil (C, Rust, Go, …)
        │  derleyici (rustc, clang, gc, …)
        ▼
.wasm  —  taşınabilir ikili modül
        │  çalıştırıcı (tarayıcı, wasmtime, wasmer, …)
        ▼
Anlık derleme (JIT/AOT) → CPU komutları
```

## Tarihçe

| Yıl | Dönüm noktası |
|---|---|
| 2013 | asm.js: Mozilla, JS'nin alt kümesiyle "yaklaşık native hız" denemesi (Emscripten çıktısı) |
| 2015 | WebAssembly topluluk grubu kuruldu; isim ilk kez duyuruldu |
| 2017 | İlk tarayıcılar (Chrome, Firefox) Wasm desteğini varsayılan olarak açtı; MVP özelliği seti dondu |
| 2019 | **Wasm 1.0** W3C Resmi Önerisi (Recommendation) oldu |
| 2022 | WasmGC, Thread'ler, SIMD gibi önemli özellikler tarayıcılarda aşamalı olarak geldi |
| 2025 | **WebAssembly 3.0** W3C standardı oldu: GC, 64-bit bellek, çoklu bellek, taşınabilir SIMD vb. tek pakette standartlaştı |
| 2026 | WASI 0.3 (native async I/O + ağ) sunucu tarafını olgunlaştırdı; Component Model üretimde kullanılmaya başlandı |

## Neden gerekti? (Problem: JS performans duvarı)

JavaScript dinamik tiplidir ve JIT derleyicileri binlerce mühendislik yılıyla optimize edilmiş olsa da, dinamik dil semantiği (tip belirsizliği, çöp toplayıcı, interpretasyon gerektiren durumlar) bazı iş yükleri için tavana çarptı:

- 3D oyunlar ve motorlar (Unity, Unreal)
- Video/audio düzenleme (native codec'lerin web'e taşınması)
- CAD/kısa vektör grafik uygulamaları
- Bilimsel hesaplama, fizik simülasyonu
- Mevcut C/C++ kod tabanlarının web'e taşınması (yeniden yazmadan)

Çözüm önce **asm.js** ile denendi: JS'nin statik olarak tiplenebilir alt kümesi + AOT derleme. Çalıştı ama formatın kendisi JS olduğu için ayrıştırma (parsing) maliyeti, taşınabilirlik ve dil tasarımı sınırları vardı. Wasm, bu fikrin "doğru soyutlama seviyesinde" yeniden tasarımıdır: **kompakt ikili format + statik tipler + tarayıcıya yeni bir sanal makine (VM)**.

## Wasm'ın tasarım hedefleri

WebAssembly spesifikasyonu dört hedefle tanımlanır:

1. **Hız** — JIT/AOT derlemeyle native hıza yakın yürütme.
2. **Güvenlik** — sandbox içinde, bellek güvenli (memory-safe), yetki tabanlı (capability-based) çalışma; kod yalnızca açıkça kendisine verilen kaynaklara erişir.
3. **Dil-bağımsızlık** — C'den Python'a birçok dilin hedefi olabilmesi.
4. **Platform-bağımsızlık** — aynı `.wasm` dosyası masaüstü, mobil, ARM/x86, tarayıcı/sunucu farkı gözetmeden çalışır.

## Wasm ≠ JavaScript'in instead'i

Bu en yaygın yanılgıdır. Wasm bilinçli olarak **DOM'a doğrudan erişemez**; hiçbir Web API'sini doğrudan çağıramaz. Tüm tarayıcı etkileşimi (DOM, canvas, network, localStorage…) JavaScript "glue" (yapıştırıcı) kodu üzerinden geçer:

```
Wasm modülü  ⇄  JS glue kodu  ⇄  Web API'leri (DOM, fetch, …)
```

Bu tasarım bilinçlidir: Wasm basit ve küçük kalır, güvenlik modeli netleşir, JS ekosistemiyle tam uyum sağlanır. Kural şu:

- **UI, olay yönetimi, DOM manipülasyonu** → JavaScript
- **Yoğun hesap, algoritmalar, mevcut kütüphaneler, oyun motoru çekirdeği** → Wasm

## "Web" içermesine rağmen web'e özgü değildir

İsim tarihsel bir kazaydı; bugün Wasm'ın büyüme alanının büyük kısmı **tarayıcı dışı**. [WASI](06-ekosistem.md#wasi) (WebAssembly System Interface) sayesinde Wasm modülleri dosya sistemi, saat, ağ gibi sistem kaynaklarına standart bir arayüzle erişebilir. Bu da Wasm'ı şunlara uygun hale getirir:

- Sunucusuz (serverless) fonksiyonlar / edge computing
- Plugin mimarileri (veritabanı eklentileri, proxy filtreleri)
- Konteyner alternatifi (güvenli, mikro)
- IoT ve gömülü sistemler

Ayrıntılar için: [06 — Ekosistem](06-ekosistem.md) ve [05 — Sektörel kullanım](05-sektorel-kullanim.md).
