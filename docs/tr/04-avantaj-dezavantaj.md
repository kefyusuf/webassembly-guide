# 4. Avantajlar ve Dezavantajlar

## ✅ Avantajlar

### 1. Performans
- Statik tipler + kompakt ikili format → JIT derlemesi JS'den çok daha öngörülebilir ve hızlıdır.
- Tipik iş yüklerinde JS'e göre **2–20x**, native koda göre **%70–95** hız.
- GC duraklaması, deoptimizasyon gibi JIT "sürprizleri" yoktur (WasmGC kullanmıyorsanız).

### 2. Güvenlik ve izolasyon
- **Sandbox zorunludur:** Modül, kendisine açıkça verilmediği sürece hiçbir sisteme erişemez (dosya, ağ, DOM…).
- **Bellek güvenli:** Lineer bellek sınır kontrolleri aşılabilir değil; C'de bile buffer overflow sandbox dışına sızmaz (trap ile güvenli durur).
- **Yetki tabanlı model:** İzinler kodda değil, çalıştırıcının verdiği import'larda → "özgürce indirdiğin kodu çalıştır" modeline uygundur.

### 3. Taşınabilirlik
- Tek `.wasm` ikilisi: x86/ARM, Windows/macOS/Linux, tarayıcı/sunucu/IoT farkı gözetmez.
- "Bir kez derle, her yerde çalıştır" vaadi — JVM'in vaadinin daha düşük seviyeli ve daha izole bir versiyonu.

### 4. Mevcut kodu yeniden kullanma
- C/C++ kütüphanelerini (codec'ler, fizik motorları, kripto, PDF… ) yeniden yazmadan web'e taşıma.
- Platformlar arası kod tekrarını azaltır: aynı çekirdek mantık web, masaüstü ve mobilde çalışır.

### 5. Küçük ve hızlı dağıtım (bulut tarafı)
- Konteyner imajına göre **kat kat** küçük (KB'lar vs yüz MB'lar).
- Soğuk başlama: **mikrosaniyeler** (konteyner: saniyeler) → serverless/edge için ideal.
- Bellek ayak izi kilobaytlarla başlar → aynı donanımda çok daha yoğun çoklu kiracılılık (multi-tenancy).

### 6. Deterministik çalışma
- Platform bağımliliği az; aynı modül farklı ortamlarda aynı davranışı verir. Blokzincir ve konsensüs sistemlerinde kritik.

## ❌ Dezavantajlar

### 1. DOM'a doğrudan erişim yok
- Her UI etkileşimi JS köprüsünden geçer; köprü geçişi (call overhead) yoğun UI manipülasyonunda darboğaz olur.
- **Sonuç:** Wasm UI katmanı için değil, hesap katmanı içindir (çalışan istisnalar: Blazor gibi "tüm UI'ı Wasm belleğinde tutup minimal köprüyle çizen" mimariler).

### 2. Veri alışverişi zahmetli
- String/dizi/nesneler lineer bellek üzerinden serileştirilir; JS tarafında GC'den bağımsız manuel bellek yönetimi gerekebilir.
- Araçlar (wasm-bindgen, embind) yardımcı olur ama öğrenme maliyeti vardır.

### 3. Ekosistem ve araç zinciri karmaşıklığı
- Ek bir derleme adımı, çapraz derleme sorunları, hata ayıklama (debugging) zorluğu. Kaynak haritaları (source map) gelişse de native bir debugger kadar akıcı değil.
- Yığın izleri (stack traces) okunması güç olabilir.

### 4. Her iş için daha hızlı DEĞİL
- Kısa ve basit işler için JS↔Wasm köprü maliyeti, kazandırdığı hızı yutabilir. Kurallı: **köprü çağrılarını azaltın, büyük iş paketleriyle geçin.**
- DOM merkezli tipik web sayfası için Wasm katkısı ~sıfırdır.

### 5. Binary boyut ve ilk yükleme (bazı zincirlerde)
- Go (resmî), Blazor, Pyodide gibi "runtime'ı taşyan" hedeflerde ilk indirme MB'larla ölçülür; mobilde hissedilir.
- Rust/AssemblyScript/TinyGo küçük çıktıda iyidir.

### 6. Standardizasyon hareketli ama tamamlanmamış alanlar
- Tarayıcı dışı dünyada WASI hâlâ sürüm sürüm ilerliyor (0.3, 2026 itibarıyla) — ekosistem standartlaşma eşiğinde, olgunluğun zirvesinde değil.
- Threads, exception handling, async gibi özelliklerin platform desteği farklı hızlarda geldi.

### 7. İnsan kaynakları ve bakım
- Rust/C++ bilen ekip gerektirebilir; JS ekibi için ek öğrenme maliyeti.
- İki dünya (JS + Wasm) demek: iki araç zinciri, iki test stratejisi.

## 🎯 Ne zaman kullanılmalı / kullanılmamalı?

| Senaryo | Wasm uygun mu? |
|---|---|
| 3D oyun, oyun motoru | ✅ Evet |
| Video/audio düzenleme, codec'ler | ✅ Evet |
| Görüntü işleme, kripto, sıkıştırma (tarayıcıda) | ✅ Evet |
| Tarayıcıda native kütüphane (FFmpeg, SQLite…) | ✅ Evet |
| Ağır hesap / bilimsel simülasyon (tarayıcıda) | ✅ Evet |
| Mevcut C/C++ kodunu web'e taşıma | ✅ Evet |
| Sunucuzuz/edge fonksiyonları, eklenti sistemi | ✅ Evet (WASI) |
| Tipik CRUD web uygulaması | ❌ Hayır — JS/TS yeterli |
| Yoğun DOM manipülasyonu | ❌ Hayır — köprü maliyeti |
| Küçük, statik web sitesi | ❌ Hayır |
| İlk yüklemesi kritik, basit interaktif sayfa | ❌ Muhtemelen hayır |

**Tek cümlelik kural:** *Arayüz JS'in, hesap Wasm'ın işidir; tarayıcı dışında ise Wasm'ı "güvenli, mikro ve taşınabilir yürütme birimi" olarak düşünün.*
