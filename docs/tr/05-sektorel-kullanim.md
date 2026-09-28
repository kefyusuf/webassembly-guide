# 5. Sektörel Kullanım: Kim, Nerede, Neden?

Bu doküman Wasm'ın gerçek dünyadaki kullanım alanlarını sektör sektörel özetler.

## 🎨 Tasarım ve yaratıcı yazılımlar

- **Figma** — alanın öncüsü. C++ ile yazılmış render motorunu Emscripten ile web'e taşımıştı; Wasm bu kararın ardından hızla kurumsal kabul gördü. Bugün Figma, mutliperson editoryal senkronizasyon hesaplarını da Wasm'da çalıştırıyor.
- **Photoshop for Web** — Adobe, ~15+ milyon satırlık C++ kod tabanını Emscripten/Wasm ile tarayıcıya taşıdı (WASM SIMD + Thread'lerle beraber).
- **AutoCAD Web** — Autodesk'in CAD motorunun tarayıcı sürümü.
- **Google Earth** — 3D küre render'ı NativeScript→Wasm geçişiyle web'de.

## 🧮 Ofis ve veri ürünleri

- **Google Sheets** — Java+WasmGC denemeleri: hesaplama motorunu tarayıcıda Wasm'da çalıştırma prototipleri.
- **Microsoft Excel** — Wasm modülü olarak dağıtılan fonksiyon desteği ve Wasm'ı Excel içinde çalıştırma yolculuğu (Excel-Labs Wasm fonksiyonları).
- **SQLite** — Resmî SQLite Wasm derlemesi; tarayıcıda veritabanı (OPFS ile kalıcılık).

## 🎮 Oyun endüstrisi

- **Unity** — WebGL/WebGPU export arka ucu Wasm tabanlı.
- **Unreal Engine** — HTML5 export'unun halefi olarak Wasm tabanlı web akışı çalışmaları.
- **Godot** — Wasm'a derlenen editör (tarayıcıda editör) ve export hedefi.
- **ebiten, Bevy** — Wasm hedefli Rust oyun motorları; tarayıcıda 60 FPS.

## ☁️ Bulut / serverless / edge

Bu alan, Wasm'ın tarayıcı-dışı büyümesinin motorudur:

| Platform | Kullanım |
|---|---|
| **Cloudflare Workers** | V8 isolates'in yanında Wasm destekli; piksel başına izolasyon, resim/video dönüşümü Wasm'da (ör. resim işleme pipeline'ları) |
| **Fastly Compute (Compute@Edge)** | Rust/Go ile derlenen Wasm programları, dünya genelinde CDN kenarında |
| **Microsoft Hyperlight** | Wasm + mikro-VM hibrit fonksiyon çalıştırma |
| **wasmCloud** | CNCF projesi; dağıtık uygulamaları Wasm component'leriyle kurma |
| **Spin (Fermyon)** | Wasm tabanlı serverless framework |
| **Lunaria/Suborbital (Sat)** | Kullanıcı sağlanan eklenti kodunu Wasm sandbox'ında çalıştırma |

Ticari gerekçe: **çok kiracılı (multi-tenant) izolasyon**. Konteyner başına ~yüz MB RAM ve saniyeler yerine, Wasm modülü başına KB'lar ve mikrosaniyeler — aynı donanımda on katlarca daha yoğun müşteri yoğunluğu.

## 🌐 Ağ altyapısı ve veritabanları (plugin mimarisi)

- **Envoy Proxy** — proxy filtrelerini Wasm eklentileriyle genişletme (resmî "Wasm filter" API'si; Proxygen/Nginx benzeri yaklaşım).
- **Shopify Functions** — satıcıların checkout mantığına (indirim, kargo, ödeme kuralları) yazdığı Rust/Go kodu Wasm sandbox'ında çalışır: **herhangi bir kod çalıştırma izni olmadan eklenti güvenliği**.
- **SQLite, PostgreSQL (eklenti denemeleri), Redpanda, Vector (Datadog)** — veri yolundaki dönüşümler Wasm eklentisi olarak.
- **CNCF**: Wasm, "container alternatifi / supplement" olarak Kuşe (Kubernetes) ekosistemine giriyor (runwasi, containerd-shim-wasmedge vb.).

## ⛓️ Blokzincir

- **Ethereum 1.x** — EVM; **Ethereum 2.0 çalışmaları** ve Polkadot/Parity: **EWASM** (Ethereum flavored Wasm) sözleşme hedefi olarak seçildi; Polkadot runtime'ı tamamen Wasm'dır.
- **CosmWasm** — CosmOS ekosisteminde akıllı sözleşmeler (Rust→Wasm).
- **NEAR Protocol** — sözleşme çalışma zamanı Wasm.
- Neden: **deterministik çalışma** + **sandbox güvenliği** + doğrulanabilirlik.

## 🔬 Bilim ve veri

- **JupyterLite** — tarayıcıda Pyodide tabanlı Jupyter; kurulum gerektirmeden Python/NumPy/Pandas.
- **Pyodide tabanlı ürünler** — tarayıcı içinde çalışan veri işleme; veri hiçbir sunucuya gitmez (gizlilik avantajı: sağlık, finans).
- **Bioinformatik/finansal modelleme** — native C/Fortran kodlarının tarayıcıda yeniden kullanımı.

## 📱 Mobil ve çapraz platform

- **Kotlin Multiplatform (Kotlin/Wasm)** — aynı iş mantığı web + native.
- **Flutter (Dart WasmGC hedefi)** — web build'lerinde JS yerine Wasm.
- **Zaplib** — Rust masaüstü uygulamalarını web'e taşıma (deneysel ama kavramsal olarak önemli).

## 🏢 Kurumsal yazılım ve eklenti güvenliği

- **Microsoft 365 / Office eklentileri** — Wasm fonksiyonları (Excel Labs).
- **Red Hat / IBM** — sunucu tarafı Wasm'da ciddi yatırımcı (Codewind, Quarkus Wasm denemeleri).
- **1Password, Figma, Cloudflare** — güvenlik açısından kritik işleri Wasm sandbox'ına taşıma vakaları.

## Sayısal özet (2026 itibarıyla genel eğilimler)

- Tarayıcı desteği: %97+ global erişilebilirlik (tüm modern tarayıcılar, Wasm 3.0 özelliklerinin çoğu).
- Sunucu tarafı: CNCF ekosisteminde hızlı benimseme; wasmtime, 2023'ten beri "en hızlı Wasm runtime" benchmark'larında liderlik ediyor (Bytecode Alliance).
- İş ilanlarında "WebAssembly" anahtar kelimesi, özellikle bulut altyapı ve oyun/motor geliştirme rollerinde büyüyor.

> Not: Sektörel veriler günceldir (Eylül 2026); bu alan hızla değiştiği için güncel rakamları [webassembly.org/roadmap](https://webassembly.org/roadmap/) ve [Wasm Community Group](https://www.w3.org/community/webassembly/) sayfalarından doğrulayın.
