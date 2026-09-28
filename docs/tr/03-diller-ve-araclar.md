# 3. Hangi Diller Wasm'a Derlenebilir?

Neredeyse her dilin bir Wasm hedefi vardır; fark **olgunluk**, **çalışma zamanı boyutu** ve **taşınabilirlik**dedir. Aşağıda en yaygın diller, araç zincirleri ve seçim rehberi yer alıyor.

## Birinci sınıf (en olgun) diller

| Dil | Araç zinciri | Hedefler | Güçlü yanı | Dikkat |
|---|---|---|---|---|
| **C / C++** | Emscripten (clang) | web, wasi | Olgunluğun zirvesi; mevcut kod tabanlarını web'e taşıma (porting) standardı | Çıktı boyutu, JS glue karmaşıklığı |
| **Rust** | `rustc` + `wasm-bindgen` / `wasm-pack` | web (unknown-unknown), wasi | Güvenli bellek, mükemmel araç desteği, küçük çıktı; topluluk standardı haline geldi | Öğrenme eğrisi |
| **Go** | Resmî derleyici (`GOOS=js GOARCH=wasm`) veya **TinyGo** | web, wasi | Standart kütüphane, kolay öğrenme; TinyGo ile ~%90 daha küçük çıktı | Resmî hedefte runtime ~1–2 MB (GC); TinyGo bazı kütüphaneleri sınırlar |
| **AssemblyScript** | Kendi derleyicisi (`npx as`) | web | TypeScript'e benzer sözdizimi; JS geliştiricisi için en düşük giriş | Topluluk projesi; dil Wasm sınırlarıyla şekillendi |

## WasmGC ile gelen yönetilen diller

Wasm 3.0'ın **GC (WasmGC)** özelliğiyle, kendi GC'sini taşımak yerine tarayıcının çöp toplayıcısını kullanan hedefler mümkün oldu — daha küçük binary, tarayıcıyla doğal nesne paylaşımı:

| Dil | Durum |
|---|---|
| **Java/Kotlin** | Kotlin/Wasm ve GraalVM Wasm hedefi üretim yolunda; Google Sheets'te Java+WasmGC denemeleri yapıldı |
| **Dart/Flutter** | Flutter Web'in yeni derleme hedefi (JS yerine) |
| **OCaml** | GC hedefi aktif geliştiriliyor |

## Diğer önemli diller

- **C# / .NET** — iki yol: (1) **Blazor WebAssembly** (tarayıcıda tam .NET runtime'ı), (2) Native AOT ile `wasm` hedefi. Ayrıca **wasmCloud** ekosisteminde component model desteği var.
- **Python** — **Pyodide** (CPython'un Wasm derlemesi; NumPy, Pandas dahil) tarayıcıda Python çalıştırır. Sunucu tarafında CPython 3.13+ resmî WASI hedefi taşıyor. Python kodu Wasm'a *derlenmez*; Wasm *içinde yorumlanır* (bu ayrım önemli — bkz. aşağıdaki kutu).
- **JavaScript/TypeScript** — elbette JS de Wasm'a derlenebilir (J2CL, `ts2wasm` gibi deneysel araçlar) ama tipik senaryo değildir.
- **Zig** — `zig build-exe -target wasm32-freestanding` ile birinci sınıf destek; C'ye modern alternatif.
- **Swift** — resmî WASI/WebAssembly hedefi Swift 6'dan itibaren.
- **Kotlin** — Kotlin/Wasm (Kotlin Multiplatform için web hedefi).
- **Ruby, PHP, Lua, Forth…** — topluluk hedefleri/çalışma zamanları mevcut.

> ⚠️ **Yorumlanan dillerin ayrımı:** Python, Ruby, PHP gibi diller için iki farklı şey vardır: (1) dilin *çalışma zamanının* Wasm'a derlenip o runtime içinde kaynak kodun yorumlanması (Pyodide bu), (2) dilin doğrudan Wasm komutlarına derlenmesi (çoğu dil için mümkün değil ya da sınırlı). Yorumlama katmanı, Wasm'ın hız avantajını büyük ölçüde ortadan kaldırır; değer, "dili tarayıcıya taşımak"ta olur.

## Hangi dili seçmeli? (Karar rehberi)

```
Mevcut C/C++ kodunu taşımak mı?            → Emscripten
En iyi geliştirici deneyimi + güvenlik mi? → Rust  (çoğu yeni proje için varsayılan)
Ekip zaten Go biliyor mu?                  → Go (TinyGo küçük çıktı için)
JS/TS ekibi ilk Wasm denemesi mi?          → AssemblyScript
Tam .NET ekosistemi tarayıcıda mı?         → Blazor WebAssembly
Tarayıcıda Python bilimsel iş mi?          → Pyodide
Sunucu/edge'de izole modül mü?             → Rust + wasmtime (yaygın), Go + Wasm, C# + wasmCloud
```

## Boyut karşılaştırması (yaklaşık, "merhaba dünya" tarzı modül)

| Dil / zincir | Yaklaşık boyut |
|---|---|
| Elle yazılmış WAT | ~100 bayt |
| Rust (minimal, `no_std`, opt) | ~1–10 KB |
| AssemblyScript | ~2–5 KB |
| C (Emscripten, minimal) | ~10–30 KB |
| TinyGo | ~10–50 KB |
| Go (resmî hedef) | ~1–2 MB (runtime dahil) |
| Blazor WebAssembly | ~5–10 MB (ilk indirme; AOT ve trimming ile azaltılabilir) |
| Pyodide | ~7–10 MB (çekirdek; kütüphaneler ekstra) |

Bu tablo bir kalite ölçüsü değil, **ilk yükleme maliyeti** göstergesidir. Sunucu/edge senaryosunda boyut daha da kritiktir.

## Araç zinciri kısa sözlüğü

- **wasm-pack / wasm-bindgen** — Rust'ın web hedefi için yüksek seviyeli köprüsü; struct'ları JS sınıflarına çevirir, string/nesne alışverişini otomatikleştirir.
- **Emscripten** — C/C++ için SDK; `emcc` derleyici + POSIX benzeri kütüphaneler + HTML üretici.
- **WABT** — `wat2wasm`, `wasm2wat`, `wasm-objdump` gibi düşük seviye araçlar.
- **Binaryen** — optimizer/post-processor (`wasm-opt`); neredeyse her zincir çıktısını bununla küçültür.
- **wasm-tools** — Rust ekosisteminin component model araç seti (`wasm-tools component new` …).
