# 2. WebAssembly Nasıl Çalışır?

## İkili format (`.wasm`)

Bir Wasm modülü, kompakt bir ikili formatta kodlanmış bölümlerden (section) oluşur:

| Bölüm | İçerik |
|---|---|
| Type | Fonksiyon imzaları (parametre/dönüş tipleri) |
| Import | Dışarıdan beklenen fonksiyon/bellek/global |
| Function | Modülün kendi fonksiyonlarının gövde indeksleri |
| Memory | Lineer bellek tanımı (min/maks sayfa) |
| Global | Sabit/değişken global değerler |
| Export | Dışarıya açılan fonksiyon/bellek/global adları |
| Start | Yükleme anında çalışacak fonksiyon |
| Code | Fonksiyon gövdeleri (asıl komutlar) |
| Data | Belleğe yüklenecek sabit veriler |

Kompakt tasarım sayesinde `.wasm` dosyaları genellikle eşdeğer JS'den **daha küçüktür** (gzip/brotli ile birlikte) ve **akış halinde derlenebilir** (indirilirken derlenmeye başlar → `WebAssembly.instantiateStreaming`).

## Stack makinesi (yığın makinesi)

Wasm, **yığın tabanlı (stack-based)** bir sanal makinedir. Komutlar operand'larını yığından alır, sonucu yığına bırakır. Örneğin `(a + b) * c`:

```
local.get $a    ;; yığına a
local.get $b    ;; yığına b
i32.add         ;; iki değeri çek, topla, sonucu yığına bırak
local.get $c    ;; yığına c
i32.mul         ;; çarp
```

Yığın kullanımı, kod doğrulamasını (validation) tek geçişte yapabilmeyi sağlar: tarayıcı, modülü çalıştırmadan **önce** tip güvenliğini tamamen doğrulayabilir. Bu, "güvenli ve hızlı" vaadinin teknik temelidir.

## WAT — Wasm'ın metin gösterimi

İkili formatın bire bir metin karşılığı **WAT** (WebAssembly Text format) vardır. Elle yazılabilir ve okunabilir (bkz. [examples/01-wat-basics](../../examples/01-wat-basics/)):

```wat
(module
  ;; fahrenheit → celsius: (f - 32) * 5 / 9
  (func (export "f2c") (param $f f64) (result f64)
    (f64.mul
      (f64.sub (local.get $f) (f64.const 32))
      (f64.const 0.5555555555555556))))

```

`wat2wasm` (WABT araç seti) ile ikiliye çevrilir. Bir `.wasm` dosyasını `wasm2wat` ile geri okuyabilirsiniz — bu, "minified JS'i okumaya" benzer ama çok daha biçimlidir.

## Sınırlı tip sistemi

Wasm MVP'de yalnızca sayısal tipler vardı; bugün (Wasm 2.0/3.0 ile):

- `i32`, `i64`, `f32`, `f64` — temel sayısal tipler
- `v128` — SIMD
- `funcref`, `externref` — referans tipler
- **WasmGC** — struct ve array tipleri; çöp toplayıcıya (GC) sahip diller (Java, Kotlin, Dart, Python) için hedef

Bu sınırlılık nedeniyle **string, dizi, nesne gibi karmaşık veriler Wasm ile JS arasında doğrudan geçemez**; lineer bellek (aşağıda) üzerinden serileştirilir ya da `externref`/GC tipleriyle taşınır.

## Lineer bellek (linear memory)

Wasm modülünün tüm verileri, **aralıksız bir bayt dizisi** olan lineer bellekte yaşar. Bellek:

- **Sayfa** birimlerinde büyür (1 sayfa = 64 KiB)
- Wasm 3.0 ile 32-bit (maks ~4 GiB) ve **64-bit** (memory64) seçenekleri var
- Komutlar bellek erişimlerinde **sınır kontrolü** yapar → C'de bile buffer overflow sandbox'ı aşamaz (segfault yerine güvenli trap)

JS ile veri alışverişi tipik olarak şöyle olur:

```js
const memory = instance.exports.memory;         // WebAssembly.Memory
const bytes = new Uint8Array(memory.buffer);    // paylaşılan görünüm
bytes.set(new TextEncoder().encode("merhaba")); // veriyi Wasm belleğine kopyala
const ptr = instance.exports.allocate(8);       // Wasm tarafında yer ayır
const result = instance.exports.process(ptr, 8);
```

Yani **string'in kendisi geçmez; bellek adresi (pointer) + uzunluk geçer**. `wasm-bindgen`, `embind` gibi araçlar bu süreci otomatikleştirir.

## Tarayıcıda yaşam döngüsü

```js
// 1. Derle (akış halinde — indirme biter bitmez derleme biter)
const { instance } = await WebAssembly.instantiateStreaming(
  fetch("modul.wasm"),
  { env: { log: (n) => console.log(n) } }   // import: Wasm'ın JS'ten istedikleri
);

// 2. Export edilen fonksiyonu çağır
console.log(instance.exports.add(2, 40));   // 42
```

Derlenmiş modül `WebAssembly.Module` objesidir; `instantiate` bağlanacak import'ları alır ve `WebAssembly.Instance` döndürür. Import/export mekanizması, modüllerin **birbirlerini** de bağlamasına izin verir — Component Model'ın temeli budur.

## Yürütme hızı nereden gelir?

1. **AOT-vari derleme:** Statik tipler sayesinde tarayıcı, JS JIT'inde olduğu gibi "tahmin et-doğrula" döngüsü yaşamadan tek geçişte makine kodu üretebilir.
2. **Kompakt format:** Ayrıştırma ve doğrulama maliyeti düşük; akış derlemesiyle indirme gecikmesi gizlenir.
3. **Öngörülebilir performans:** GC duraklaması yok (WasmGC kullanmıyorsanız), deopt yok → gerçek zamanlı uygulamalar için JS'den öngörülebilir.

Gerçekçi beklenti: native kodun **%70–95'i** civarı hız (iş yüküne göre). JS'e göre tipik olarak **2–20x** hız.

## Sunucuda yaşam döngüsü (WASI)

Tarayıcı dışında modül, bir **runtime** (wasmtime, Wasmer, WasmEdge, Node) tarafından yüklenir. Runtime, host fonksiyonlarını import olarak sağlar:

```
merhaba.wasm  ──▶  wasmtime run merhaba.wasm
                      │  sandbox + WASI import'ları (fd_read, clock_time_get…)
                      ▼
                  İşletim sistemi
```

Ana uygulama (ör. bir veritabanı) yalnızca **istediği** host fonksiyonlarını verir: dosya erişimi yoksa modül dosyaya erişemez — izin, kodda değil **yapılandırmadadır** (yetki tabanlı güvenlik). Bu, Docker konteynerine göre çok daha ince bir izolasyon birimidir (başlatma süresi mikrosaniyeler, bellek kilobaytlar).

## Özet akış

```
Kaynak kod → Wasm'a derle (.wasm) → Yükle (browser/runtime)
    → Doğrula (tip güvenliği tek geçişte) → Derle (JIT/AOT)
    → Sandbox'ta yürüt (lineer bellek + sınır kontrolü)
    → JS/host ile import-export üzerinden konuş
```
