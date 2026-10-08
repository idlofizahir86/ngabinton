# `ASSETS.md`

# ASSETS — NGABINTON

> **Daftar aset gambar + prompt untuk generate.**
> 1 aset = 1 prompt. Generate via tool AI pilihan Anda, lalu simpan ke path yang tertera.
> Referensi visual jersey: `_ref/jersey_ngabinton.jpeg`.

---

## 0. Aturan Global (WAJIB dipatuhi semua prompt)

**Jersey NGABINTON** (lihat `BRAND.md` §7.4):
- Base **biru**, aksen **lime/kuning** di lengan
- Motif **halftone dot** (biru → ungu → kuning) di badan
- **Wordmark "NGABINTON"** di dada

**Aturan lain:**
- Karakter **perempuan WAJIB memakai hijab + base layer** (busana menutup aurat).
- Gaya: **candid, hangat, natural**. ❌ bukan kartun/3D/clipart.
- ❌ tanpa watermark, tanpa teks asing di dalam gambar (kecuali wordmark jersey).
- ❌ tanpa wajah tokoh publik/nyata.
- Warm tone (sedikit keemasan), kontras sedang, ❌ tanpa HDR / filter Instagram.
- Simpan format **JPG** (aset statis di `public/`). Upload via admin nanti akan dikonversi WebP oleh server.

**Suffix saran (tempel di akhir setiap prompt):**
> `photorealistic, candid documentary style, warm golden tone, natural light, medium contrast, no text overlay, no watermark, no logo, high detail`

---

## 1. Landing — Hero

### `public/brand/hero-community.jpg`
- **Ukuran/spec:** 21:9 (mis. 2100×900)
- **Dipakai di:** Hero landing (`HERO_IMAGE_URL`)
- **Prompt:**
  > Wide cinematic photo of a friendly Indonesian badminton community posing together on an indoor badminton court, mixed men and women (women wearing hijab and a modest base layer under the jersey), all wearing the same **blue sports jersey with lime-yellow sleeve accents and a blue-to-purple-to-yellow halftone dot print**, the word "NGABINTON" printed on the chest, some holding badminton rackets, laughing and relaxed, candid group moment, warm golden lighting, darker area at the bottom for text overlay, photorealistic, candid documentary style, medium contrast, no watermark, no extra text, 21:9 aspect ratio.

### `public/og/default.jpg`
- **Ukuran/spec:** 1200×630
- **Dipakai di:** OG image default (share social)
- **Prompt:**
  > Cinematic photo of a small friendly badminton community standing together on an indoor court, men and women (women wearing hijab and modest base layer) in **matching blue sports jerseys with lime-yellow sleeve accents and blue-to-purple-to-yellow halftone dot print** with "NGABINTON" on the chest, warm golden light, dark background, plenty of clean dark space on the left for a title, photorealistic, candid documentary style, no text overlay, no watermark, 1200x630 composition.

---

## 2. Event — Lan Jalan Vol. 1

### `public/events/lanjalan-vol-1/hero-walini.jpg`
- **Ukuran/spec:** 21:9 (mis. 2100×900)
- **Dipakai di:** `TravelHero` halaman `/lanjalan-vol-1`
- **Prompt:**
  > Wide cinematic photo of Walini Hot Spring in Ciwidey, West Java: natural hot spring pools surrounded by pine forest and tea plantations on the slope of a mountain, soft morning mist, warm golden light, a few visitors relaxing on the edge of the pool, aerial-ish wide view, photorealistic landscape photography, medium contrast, no text, no watermark, 21:9 aspect ratio, darker at the bottom for text overlay.

### `public/events/lanjalan-vol-1/cover-travel.jpg`
- **Ukuran/spec:** 1200×630
- **Dipakai di:** OG image halaman event + card
- **Prompt:**
  > Cinematic travel photo of a group of friends (men and women, women wearing hijab and modest base layer) in **matching blue jerseys with lime-yellow accents** arriving at a mountain hot spring area in Ciwidey, a rented green city minivan (angkot) parked behind them, pine forest and tea fields, warm afternoon light, candid documentary style, photorealistic, no text overlay, no watermark, 1200x630 composition.

### `public/events/lanjalan-vol-1/dest-walini.jpg`
- **Ukuran/spec:** 4:3 (mis. 1600×1200)
- **Dipakai di:** `DestinationCard` (Destinasi)
- **Prompt:**
  > Photo of a natural hot spring pool at Walini, Ciwidey: steaming turquoise water, stone edges, surrounded by pine trees and green tea plantation hills, a wooden gazebo, calm and inviting, warm morning light, photorealistic travel photography, medium contrast, no people's faces, no text, no watermark, 4:3 aspect ratio.

### `public/events/lanjalan-vol-1/transport-angkot.jpg`
- **Ukuran/spec:** 16:9 (mis. 1600×900)
- **Dipakai di:** `TransportCard` (Naik Apa?)
- **Prompt:**
  > Photo of a rented Indonesian public minivan (angkot) driving on a scenic winding mountain road in Ciwidey, West Java, green tea plantations and pine trees along the road, clear sky, warm daylight, candid documentary style, photorealistic, no text, no watermark, 16:9 aspect ratio.

### `public/events/lanjalan-vol-1/food-pawon.jpg`
- **Ukuran/spec:** 4:3 (mis. 1600×1200)
- **Dipakai di:** Section Makan Siang
- **Prompt:**
  > Photo of a casual Sundanese restaurant terrace overlooking a green tea plantation, wooden tables and benches, warm afternoon light, relaxed rural atmosphere, photorealistic, candid documentary style, no text, no watermark, 4:3 aspect ratio.

### `public/events/lanjalan-vol-1/menu-pawon.jpg`
- **Ukuran/spec:** 4:3 (mis. 1600×1200)
- **Dipakai di:** Section Makan Siang (menu)
- **Prompt:**
  > Overhead photo of a Sundanese meal: nasi liwet rice on banana leaf, fried egg, and fried nuggets, simple rustic plate, wooden table, natural daylight, appetizing, photorealistic food photography, no text, no watermark, 4:3 aspect ratio.

### `public/events/lanjalan-vol-1/narrative-meme.jpg`
- **Ukuran/spec:** 16:9 (mis. 1600×900)
- **Dipakai di:** Section Narasi (`#narasi`)
- **Catatan:** `CONTENT.md` §4.4 minta "meme karakter lucu". `BRAND.md` melarang clipart/3D — dipakai **ilustrasi flat sederhana** saja.
- **Prompt:**
  > Simple flat vector illustration, minimal style: three friends (one woman wearing hijab and modest base layer, two men) wearing **blue jerseys with lime-yellow accents and "NGABINTON" on the chest**, standing confused in front of a fork in the road with arrows pointing in different directions, muted palette limited to brand colors (blue, lime, warm off-white, dark charcoal), clean bold shapes, no gradients, no 3D, no text, no watermark, 16:9 aspect ratio.

### `public/events/lanjalan-vol-1/participants-collage.jpg`
- **Ukuran/spec:** 1:1 (mis. 1600×1600)
- **Dipakai di:** Section Peserta (`#peserta`)
- **Catatan:** **Jangan** tampilkan nama; ini boleh berupa kolase beberapa foto.
- **Prompt:**
  > Photo collage grid of a friendly Indonesian badminton/travel group, mixed men and women (women wearing hijab and modest base layer), all in **blue jerseys with lime-yellow accents and blue-to-purple-to-yellow halftone dot print**, "NGABINTON" on the chest, candid laughing moments inside a rented minivan and at a mountain hot spring, warm tone, photorealistic, clean 3x3 grid collage with thin white gutters, no text, no watermark, 1:1 aspect ratio.

---

## 3. Galeri Landing — "Momen Kami"

> Dipakai di section `#galeri` (`event_media` type `gallery`). Section disembunyikan bila belum ada media.
> Disarankan 4–6 foto, rasio **1:1**.

### `public/gallery/momen-01.jpg`
- **Prompt:**
  > Candid photo of friends in **blue NGABINTON jerseys with lime-yellow accents** warming up on an indoor badminton court before playing, shuttlecocks on the floor, warm indoor light, motion and laughter, photorealistic, candid documentary style, no text, no watermark, 1:1 aspect ratio.

### `public/gallery/momen-02.jpg`
- **Prompt:**
  > Candid photo of a group (men and women, women wearing hijab and modest base layer) in **matching blue jerseys** sharing a meal together at a simple Sundanese restaurant, laughing, warm afternoon light, photorealistic, candid documentary style, no text, no watermark, 1:1 aspect ratio.

### `public/gallery/momen-03.jpg`
- **Prompt:**
  > Candid photo of a group in **blue jerseys** soaking their feet at the edge of a natural hot spring pool surrounded by pine forest, relaxed and joking, warm golden light, photorealistic, candid documentary style, no text, no watermark, 1:1 aspect ratio.

### `public/gallery/momen-04.jpg`
- **Prompt:**
  > Candid photo of friends in **blue NGABINTON jerseys** sitting together inside a rented city minivan (angkot) during a trip, windows showing tea plantations, laughing, warm light, photorealistic, candid documentary style, no text, no watermark, 1:1 aspect ratio.

---

## 4. Logo & Favicon (BUKAN AI — ekspor manual)

| Aset | Cara |
|---|---|
| `public/brand/logo.svg`, `logo-dark.svg`, `logo-light.svg`, `logo-icon.svg`, `logo-wordmark.svg` | **Ekspor ulang** dari `_ref/logo_ngabinton.png` jadi SVG bersih (bukan generate AI). Lihat `BRAND.md` §3. |
| `public/brand/favicon.ico` | Turunan dari `logo-icon` (shuttlecock), 32×32. Lihat `BRAND.md` §3.4. |

---

## 5. Cara Pakai Setelah Aset Siap

1. Simpan file sesuai path di atas (di dalam `public/`).
2. Untuk hero landing: buka `src/app/(public)/page.tsx` dan isi
   `const HERO_IMAGE_URL = "/brand/hero-community.jpg";`
3. Untuk event: isi kolom `hero_image_url` / `cover_image_url` di admin (M7) — atau sudah ada di seed.
4. Jalankan `pnpm build` untuk memastikan tidak ada error.

> Setelah semua aset dibuat, centang juga `CONTENT.md` §10 & Backlog `TASK.md` (B2).
