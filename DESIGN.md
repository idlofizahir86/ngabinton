# `DESIGN.md`

# DESIGN — NGABINTON

> **Sumber kebenaran untuk semua keputusan visual.**
> Agent DILARANG memakai warna, font, spacing, atau komponen di luar token di sini.
> Kalau butuh token baru, tambah dulu di sini, minta konfirmasi manusia.

---

## 0. Ringkasan Cepat (TL;DR)

Agent boleh pakai blok ini untuk grep cepat. Detail lengkap ada di bawah.

```yaml
# Warna inti
background:     "#141414"   # kanvas gelap default
surface:        "#1f1f1f"
surface-hover:  "#2d2d2d"
border:         "#404040"
text:           "#ffffff"
text-muted:     "#b3b3b3"
primary:        "#e50914"   # NGABINTON red — CTA & brand
live:           "#22c55e"   # status aktif/presensi dibuka

# Varian storytelling (untuk halaman travel)
story-bg:       "#f7f5ef"   # off-white hangat
story-text:     "#1a1a1a"
story-muted:    "#6b6b6b"
story-teal:     "#2a7d92"   # dari Canva
story-orange:   "#f59e0b"   # dari Canva
story-script:   "#c2410c"   # untuk font script

# Font
font-display:   "Anton"
font-body:      "Inter"
font-script:    "Caveat"
font-arabic:    "Noto Naskh Arabic"
font-mono:      "JetBrains Mono"

# Spacing & radius
spacing-base:   4px
radius-sm:      4px
radius-md:      8px
radius-lg:      12px
radius-xl:      20px
radius-pill:    999px

# Motion
duration-fast:  150ms
duration-base:  250ms
duration-slow:  400ms
easing:         "cubic-bezier(0.32, 0.72, 0, 1)"
easing-out:     "cubic-bezier(0.16, 1, 0.3, 1)"
```

---

## 1. Prinsip Desain

1. **Konten adalah bintang, UI menghilang.** Poster event, foto kegiatan, dan teks konten mendominasi. Chrome (navbar, border, shadow) seminimal mungkin.
2. **Dua mood, satu identitas.** Halaman utama gelap dan sinematik. Halaman travel terang dan hangat. Tapi keduanya tetap NGABINTON.
3. **Merah = aksi. Hijau = status. Bukan sebaliknya.** Warna aksen tidak boleh tumpang-tindih makna.
4. **Spacing ritmis, bukan acak.** Semua spacing kelipatan 4px. Tidak ada `padding: 13px`.
5. **Motion fungsional, bukan dekoratif.** Animasi ada untuk menjelaskan perubahan, bukan menghibur.
6. **Aksesibilitas bukan opsional.** Kontras minimum AA. Semua elemen interaktif punya focus state.

---

## 2. Varian Halaman

NGABINTON punya **dua varian visual**. Agent harus tahu mana yang dipakai di halaman mana.

| Varian | Dipakai di | Nuansa | Background |
|---|---|---|---|
| **Cinema** (default) | Landing, arsip, admin, event badminton | Netflix gelap, tegas, fokus | `#141414` |
| **Storytelling** | Halaman event travel (contoh: `/lanjalan-vol-1`) | Off-white, hangat, seperti majalah perjalanan | `#f7f5ef` |

### Aturan Varian
1. Halaman event travel **boleh** campur keduanya: hero gelap → cerita terang → CTA gelap.
2. Navbar & footer **selalu** pakai varian cinema (gelap). Ini yang jadi "frame" halaman.
3. Admin dashboard **selalu** cinema. Tidak ada storytelling di admin.
4. Kalau ragu, pakai cinema.

### Ritme Halaman Travel (contoh: `/lanjalan-vol-1`)
```
🌑 Navbar (gelap, sticky)
🌑 Travel Hero (poster, gelap, sinematik)
⚪ Sub-nav (sticky, scroll-spy anchor)
⚪ Ayat & Narasi (terang)
⚪ Destinasi (terang)
⚪ Transportasi (terang)
🌑 Rundown (gelap, kontras)
⚪ Makan Siang (terang)
⚪ Biaya (terang)
⚪ Tukar Kado (terang)
⚪ Peserta (terang)
🌑 Presensi & Penutup (gelap)
🌑 Footer (gelap)
```

Aturan: **jangan pernah dua section gelap berturut-turut tanpa jeda**. Selalu selingi terang. Dan sebaliknya.

---

## 3. Warna

### 3.1 Varian Cinema

| Token | Nilai | Penggunaan |
|---|---|---|
| `background` | `#141414` | Kanvas utama, navbar, footer |
| `background-elevated` | `#232323` | Navbar saat scroll, hero overlay bawah |
| `surface` | `#1f1f1f` | Card, panel, modal |
| `surface-hover` | `#2d2d2d` | Hover state card, dropdown, tooltip |
| `border` | `#404040` | Divider tipis, border tabel |
| `border-strong` | `#808080` | Border input, border tombol secondary |
| `text` | `#ffffff` | Heading, teks utama |
| `text-secondary` | `#e5e5e5` | Paragraf, deskripsi |
| `text-muted` | `#b3b3b3` | Caption, meta, timestamp |
| `text-subtle` | `#808080` | Index, timestamp kecil |

### 3.2 Varian Storytelling

| Token | Nilai | Penggunaan |
|---|---|---|
| `story-bg` | `#f7f5ef` | Background section terang |
| `story-bg-alt` | `#efece4` | Section alternating (subtle) |
| `story-surface` | `#ffffff` | Card di section terang |
| `story-border` | `#e5e0d5` | Divider di section terang |
| `story-text` | `#1a1a1a` | Heading, teks utama |
| `story-text-secondary` | `#3d3d3d` | Paragraf |
| `story-muted` | `#6b6b6b` | Caption, meta |
| `story-teal` | `#2a7d92` | Aksen judul, border, ikon (dari Canva) |
| `story-orange` | `#f59e0b` | Aksen sekunder, hover, underline |
| `story-script` | `#c2410c` | Warna untuk font script (Caveat) |

### 3.3 Aksen & Status (dipakai di kedua varian)

| Token | Nilai | Penggunaan |
|---|---|---|
| `primary` | `#e50914` | CTA utama, tombol, brand accent |
| `on-primary` | `#ffffff` | Teks di atas primary |
| `live` | `#22c55e` | Status "LIVE", presensi dibuka, sukses |
| `warning` | `#f59e0b` | Peringatan, duplikat, hampir tutup |
| `danger` | `#ef4444` | Error, aksi destruktif |

### 3.4 Aturan Pakai Warna

1. **Merah `primary` hanya untuk elemen yang bisa diklik atau status penting.** Jangan pakai merah sebagai background section.
2. **Hijau `live` hanya untuk status.** Jangan pakai hijau untuk tombol aksi — itu tugas merah.
3. **Tidak ada dua warna aksen dalam satu komponen.** Tombol tidak boleh merah dengan border hijau.
4. **Maksimal satu aksen kuat per viewport.** Kalau merah sudah dominan, tidak perlu teal/orange.
5. **Varian storytelling tidak boleh pakai `primary` (merah).** Pakai `story-teal` atau `story-orange` sebagai gantinya. Merah hanya muncul di section gelap.

---

## 4. Tipografi

### 4.1 Font Family

| Token | Font | Fallback | Penggunaan |
|---|---|---|---|
| `font-display` | **Anton** | Impact, sans-serif | Judul hero, judul event besar |
| `font-body` | **Inter** | system-ui, sans-serif | Semua body, heading, caption, UI |
| `font-script` | **Caveat** | Brush Script MT, cursive | Aksen dekoratif storytelling (maks 1–2 per halaman) |
| `font-arabic` | **Noto Naskh Arabic** | Amiri, serif | Ayat Al-Quran |
| `font-mono` | **JetBrains Mono** | ui-monospace, monospace | Kode sesi QR, ID, timestamp teknis |

Semua font dimuat via `next/font` (auto-optimized, no FOUT).

### 4.2 Skala Tipografi

| Skala | Font | Desktop | Mobile | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|---|
| `display` | Anton | 88px | 48px | 400 | 1.05 | -0.02em |
| `display-sm` | Anton | 56px | 36px | 400 | 1.1 | -0.01em |
| `heading` | Inter | 40px | 28px | 700 | 1.15 | -0.01em |
| `subheading` | Inter | 24px | 20px | 600 | 1.3 | 0 |
| `body-lg` | Inter | 18px | 17px | 400 | 1.5 | 0 |
| `body` | Inter | 16px | 15px | 400 | 1.5 | 0 |
| `body-sm` | Inter | 14px | 13px | 400 | 1.5 | 0 |
| `caption` | Inter | 12px | 12px | 500 | 1.4 | 0.04em, uppercase |
| `script` | Caveat | 48px | 32px | 400 | 1.2 | 0 |
| `arabic` | Noto Naskh | 32px | 24px | 400 | 2.0 | 0 (RTL) |

### 4.3 Aturan Tipografi

1. **Maksimal satu `display` per halaman.** Biasanya di hero.
2. **Angka waktu di rundown pakai `tabular-nums`** (`font-variant-numeric: tabular-nums`) supaya sejajar.
3. **Uppercase hanya untuk caption dan badge.** Jangan untuk paragraf.
4. **Font script (Caveat) maksimum 1–2 kali per halaman.** Kalau lebih, terasa norak.
5. **Ayat Arab selalu ada terjemahan.** Tidak boleh tampil Arab saja tanpa terjemahan Indonesia.
6. **Panjang baris ideal: 50–75 karakter.** Untuk body paragraf, batasi lebar container maksimum ~65ch.

---

## 5. Spacing & Layout

### 5.1 Spacing Scale
Base unit: **4px**. Semua nilai harus kelipatan 4.

```
4, 8, 12, 16, 24, 32, 48, 64, 96, 128
```

| Konteks | Nilai |
|---|---|
| Gap icon-teks | 8px |
| Padding badge | 4px 10px |
| Padding tombol | 12px 24px |
| Padding card | 16–24px |
| Gap antar card carousel | 12–16px |
| Padding section horizontal (desktop) | 64px |
| Padding section horizontal (mobile) | 16–24px |
| Jarak antar section | 64–96px (cinema) / 96–128px (storytelling) |
| Padding hero atas | 96–128px |

### 5.2 Container

| Konteks | Max-width |
|---|---|
| Landing & carousel | 1600px |
| Halaman event | 1024px |
| Halaman event (section cerita) | 720px (untuk readability) |
| Halaman admin | 1280px |
| Form presensi peserta | 480px |

### 5.3 Breakpoints

| Token | Lebar | Konteks |
|---|---|---|
| `sm` | 640px | Mobile besar |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop lebar |
| `2xl` | 1536px | Large display |

**Behavior kolom carousel:**
- < 640px: 1.2 card (peek)
- 640–1023px: 2–3 cards
- 1024–1535px: 4–5 cards
- ≥ 1536px: 6–7 cards

### 5.4 Radius

| Token | Nilai | Penggunaan |
|---|---|---|
| `radius-sm` | 4px | Badge, tag kecil |
| `radius-md` | 8px | Tombol, input, card kecil |
| `radius-lg` | 12px | Card event, modal |
| `radius-xl` | 20px | Panel besar, hero card |
| `radius-pill` | 999px | Tombol pill, badge status |

### 5.5 Shadow

| Token | Nilai | Penggunaan |
|---|---|---|
| `shadow-card` | `0 4px 24px rgba(0, 0, 0, 0.45)` | Card default (cinema) |
| `shadow-card-hover` | `0 12px 40px rgba(0, 0, 0, 0.65)` | Card hover |
| `shadow-elevated` | `0 8px 32px rgba(0, 0, 0, 0.55)` | Modal, dropdown |
| `shadow-focus` | `0 0 0 2px #141414, 0 0 0 4px #e50914` | Focus ring |
| `shadow-story` | `0 2px 12px rgba(0, 0, 0, 0.06)` | Card di section terang |

---

## 6. Motion

| Token | Durasi | Penggunaan |
|---|---|---|
| `duration-fast` | 150ms | Hover, focus, toggle, warna |
| `duration-base` | 250ms | Card hover scale, transisi modal, navbar |
| `duration-slow` | 400ms | Hero entrance, transisi halaman, carousel besar |

| Token | Easing | Penggunaan |
|---|---|---|
| `easing` | `cubic-bezier(0.32, 0.72, 0, 1)` | Default untuk semua interaksi |
| `easing-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrance, reveal, modal |

### Aturan Motion

1. **Hover scale maksimum 1.04.** Lebih dari itu terasa gimmicky.
2. **Tidak ada animasi loop** kecuali dot "LIVE" (pulse 2s).
3. **`prefers-reduced-motion: reduce`** wajib dihormati: matikan transform, transisi opacity dikurangi ke 150ms.
4. **Jangan animasikan `width`, `height`, `top`, `left`.** Pakai `transform` dan `opacity` untuk performa.
5. **Stagger entrance maksimum 80ms** antar item.

---

## 7. Komponen Pattern

Section ini mendefinisikan **tampilan** komponen. Implementasi detail ada di `COMPONENTS.md`.

### 7.1 Navbar (Cinema)
- Latar transparan di atas hero, berubah `background-elevated` + `shadow-card` setelah scroll > 40px.
- Logo NGABINTON (Anton, 24px, putih) di kiri.
- Menu tengah: `Event`, `Arsip`, `Tentang` (Inter 14px, `text-muted`, hover → `text`).
- Kanan: tombol "Masuk" (ghost kecil) atau menu user (avatar bulat).
- Transisi 250ms `easing`.
- Mobile: hamburger → sheet full-screen dari atas.

### 7.2 Hero Landing (Cinema)
- Tinggi 80vh desktop / 70vh mobile.
- Background foto komunitas dengan overlay:
  `linear-gradient(180deg, rgba(20,20,20,0.2) 0%, rgba(20,20,20,0.6) 60%, #141414 100%)`.
- Konten: `display` "NGABINTON" + `subheading` tagline + dua CTA (primary "Lihat Event" + ghost "Tentang").
- Metadata bar bawah: jumlah member, tahun berdiri, kota — `caption` uppercase, dipisah `·`.

### 7.3 Row Carousel (Cinema)
- Judul row: `subheading` + link "Lihat semua →" (ghost, `text-muted`).
- Container `overflow-x: auto`, `scroll-snap-type: x mandatory`, gap 16px.
- Padding horizontal section: 64px desktop, 16px mobile.
- Panah navigasi kiri/kanan muncul saat hover (desktop only), tidak tampil di touch device.
- Tepi kanan-kiri diberi gradient fade 48px agar terasa "mengalir keluar layar".

### 7.4 Event Card (Cinema)
- Aspect ratio **16:9**, radius `radius-md` (8px), overflow hidden.
- Badge volume kiri-atas: `caption` + background `primary` + `radius-sm` (contoh: "VOL. 1").
- Judul event di bawah poster: `body` weight 600.
- Tanggal: `caption` `text-muted`.
- Hover (desktop): scale 1.04, `shadow-card-hover`, overlay tipis `rgba(0,0,0,0.3)`.
- Focus: outline 2px `primary`, offset 2px.

### 7.5 Travel Hero (Storytelling variant — kiri gelap)
- Tinggi 80vh desktop / 90vh mobile.
- Background foto destinasi (contoh Walini) dengan overlay dari bawah.
- Badge "Vol. 1" di atas judul (kecil, `story-orange` atau putih outline).
- Judul: `display` nama event.
- Subjudul: `heading` lokasi (contoh "Walini Hot Spring, Ciwidey").
- Metadata bar: tanggal · waktu · transportasi · biaya, `caption`, dipisah `·`.
- Dua CTA: primary "Lihat Rundown" + ghost "Presensi" (kalau sesi dibuka).

### 7.6 Quran Quote (Storytelling)
- Background `story-bg`.
- Arab: `arabic` font, `direction: rtl`, `text-align: center`, line-height 2, warna `story-text`.
- Terjemahan: `body-lg`, `story-text-secondary`, max-width 65ch, center.
- Sumber: `caption` uppercase, `story-muted`, center, dipisah garis horizontal kecil.
- Padding vertikal: 96px desktop, 64px mobile.

### 7.7 Story Narrative (Storytelling)
- Layout dua kolom di desktop (60/40), satu kolom di mobile.
- Arah alternasi: ganjil (teks kiri, gambar kanan), genap (gambar kiri, teks kanan).
- Judul: `heading` `story-text`.
- Body: `body-lg` `story-text-secondary`, line-height 1.7.
- Gambar: radius `radius-lg`, shadow `shadow-story`.
- Gap antar kolom: 64px desktop.

### 7.8 Destination Card (Storytelling)
- Card full-width dengan background `story-surface`, radius `radius-lg`, shadow `shadow-story`.
- Layout: gambar kiri (50%), konten kanan (50%).
- Konten: nama destinasi (`heading`), region (`caption` uppercase `story-teal`), deskripsi (`body`), durasi kunjungan (badge kecil).
- Gambar: aspect ratio 4:3, object-cover.

### 7.9 Transport Card (Storytelling)
- Background `story-bg-alt`, radius `radius-lg`.
- Ikon kendaraan besar (64px) di atas.
- Judul: `heading`.
- Deskripsi: `body`.
- List titik jemput: bullet dengan dot `story-orange` 6px.
- Foto kendaraan di bawah, aspect 16:9.

### 7.10 Rundown Timeline
**Dua varian:**

**Cinema (gelap):**
- Judul: `subheading` putih.
- Setiap item:
  - Kolom kiri: waktu `body-sm` `text-subtle`, `tabular-nums`, lebar tetap 100px.
  - Garis vertikal 1px `border`, dot 8px `primary`.
  - Kolom kanan: judul aktivitas `body` weight 600 putih, catatan `body-sm` `text-muted`.
- Item sedang berlangsung: dot ber-pulse `live`, border kiri 2px `live`.

**Storytelling (terang):**
- Judul: `heading` `story-text`.
- Setiap item:
  - Kolom kiri: waktu `body-sm` `story-muted`, `tabular-nums`, lebar 100px.
  - Garis vertikal 1px `story-border`, dot 8px `story-teal`.
  - Kolom kanan: judul `body` weight 600 `story-text`, catatan `body-sm` `story-muted`.
- Item optional (seperti petik stroberi): beri badge kecil `caption` uppercase `story-muted` di samping judul.
- Padding item: 24px 0.

### 7.11 Budget Table (Storytelling)
- Background `story-surface`, radius `radius-lg`, shadow `shadow-story`, padding 32px.
- Header: kolom `#`, `Item`, `Jumlah` — `caption` uppercase `story-muted`.
- Setiap baris: `body`, border-bottom 1px `story-border`.
- Baris terakhir (TOTAL): `subheading` `story-text`, background `story-bg-alt`, radius `radius-md`, padding tebal.
- Angka rupiah: `font-mono` untuk kesan presisi.

### 7.12 Gift Exchange Info (Storytelling)
- Card dengan background `story-orange` 15% opacity, border kiri 4px `story-orange`, radius `radius-md`.
- Icon 🎁 (atau Lucide `Gift`) 32px.
- Judul: `subheading`.
- Aturan list: bullet dengan check `story-orange`.
- Padding 24px.

### 7.13 Participant Grid (Storytelling)
- Grid foto collage dengan gap 8px.
- Kolom responsif: 4 (desktop), 3 (tablet), 2 (mobile).
- Setiap foto: aspect 1:1 atau 4:5, radius `radius-md`, object-cover.
- Hover: scale 1.03, shadow.
- Tidak ada nama di bawah foto (privacy default) kecuali diminta.

### 7.14 Closing Message (Storytelling)
- Background `story-bg`.
- Font `script` (Caveat) besar, `story-script` (oranye-merah), center.
- Contoh: "See you in the ANGKOT!"
- Di bawah: CTA ghost "Lihat Event Lain".

### 7.15 Section Transition
- Gradient vertikal 96px antara section gelap dan terang.
- Kalau gelap → terang: `linear-gradient(180deg, #141414 0%, #f7f5ef 100%)`.
- Kalau terang → gelap: kebalikannya.
- Jangan pakai border tebal; gradient harus seamless.

### 7.16 Buttons

**Primary (Cinema):**
- Background `primary`, teks `on-primary`.
- Padding 12px 24px, radius `radius-md`, weight 600.
- Hover: brightness 1.1, transition 150ms.
- Active: scale 0.98.
- Focus: `shadow-focus`.

**Primary (Storytelling):**
- Background `story-teal`, teks putih.
- Sisanya sama dengan Cinema.

**Ghost:**
- Border 1px `border-strong` (cinema) / `story-border` (storytelling).
- Teks `text` / `story-text`.
- Hover: background `surface-hover` / `story-bg-alt`.

**Icon button:**
- Ukuran minimal 44×44px, radius `radius-pill`.

**Danger:**
- Teks `danger`, border `danger` (bukan background).
- Untuk aksi destruktif: hapus event, reset sesi.

### 7.17 Input

**Cinema:**
- Background `surface`, border 1px `border`, radius `radius-md`.
- Padding 12px 16px, teks `text`.
- Placeholder `text-muted`.
- Focus: border `primary`, ring `shadow-focus`.

**Storytelling:**
- Background `story-surface`, border 1px `story-border`, radius `radius-md`.
- Teks `story-text`, placeholder `story-muted`.
- Focus: border `story-teal`, ring `0 0 0 3px rgba(42,125,146,0.2)`.

**Error state (kedua varian):**
- Border `danger`, teks error di bawah field, ukuran `body-sm`, warna `danger`.
- Icon `!` di kiri teks.

### 7.18 Badge

| Jenis | Background | Teks | Bentuk |
|---|---|---|---|
| `live` | `live` 20% opacity | `live` | pill + dot pulse |
| `volume` | `primary` | `on-primary` | `radius-sm`, caption uppercase |
| `optional` | `story-bg-alt` | `story-muted` | `radius-sm`, caption |
| `closed` | `surface-hover` | `text-muted` | pill |

### 7.19 QR Display (Admin)
- Card background `surface`, padding 32px, radius `radius-xl`.
- QR code 320×320 (desktop) / 240×240 (mobile), **background putih dengan padding putih 24px**.
- Di bawah QR: URL pendek (`font-mono`, `body-sm`, bisa di-copy).
- Status badge `LIVE` di atas QR, kanan.
- Tombol aksi: `Refresh QR` (ghost), `Tutup Presensi` (primary).
- Konfirmasi sebelum tutup: pakai `<Dialog />` dengan copy dari `CONTENT.md`.

### 7.20 Toast
- Posisi kanan-bawah, lebar maks 360px.
- Background `surface`, `shadow-elevated`, radius `radius-md`, padding 16px.
- Icon 20px kiri (check hijau / warning / x merah).
- Auto dismiss 4s.
- Entrance: slide dari kanan + fade, 250ms.

---

## 8. Accessibility

### 8.1 Kontras

| Kombinasi | Rasio | Status |
|---|---|---|
| `text` di `background` (cinema) | 18:1 | AAA ✅ |
| `text-muted` di `background` | 9:1 | AAA ✅ |
| `on-primary` di `primary` | 5.5:1 | AA ✅ |
| `live` di `background` | 8:1 | AAA ✅ |
| `primary` di `background` | 2.4:1 | ❌ Jangan untuk teks |
| `story-text` di `story-bg` | 15:1 | AAA ✅ |
| `story-muted` di `story-bg` | 5.8:1 | AA ✅ |

**Aturan:** `primary` (merah) **tidak boleh** jadi warna teks di atas background gelap tanpa pendamping. Selalu pakai putih di dalam tombol berbackground merah.

### 8.2 Focus
- Semua elemen interaktif wajib punya `:focus-visible`.
- Focus ring: 2px solid `primary` (cinema) / `story-teal` (storytelling), offset 2px.
- Jangan pakai `outline: none` tanpa pengganti.

### 8.3 Target Sentuh
- Minimum 44×44px (iOS) / 48×48px (Android) untuk semua tombol, link navigasi, dan kontrol form.
- Card event di mobile minimal 140px lebar.

### 8.4 Motion
- Hormati `prefers-reduced-motion: reduce`.
- Matikan: dot pulse, hover scale, entrance animation.
- Transisi opacity: tetap boleh, tapi dikurangi ke 150ms.

### 8.5 Konten
- Semua gambar punya `alt` deskriptif.
- QR code selalu ada teks alternatif + URL pendek di bawahnya.
- Form error diumumkan via `aria-live="polite"`.
- Status "LIVE" selalu disertai teks, tidak hanya warna.
- Ayat Arab dan terjemahan di-wrap dalam `<figure>` + `<figcaption>` dengan `lang="ar"` dan `lang="id"`.

### 8.6 Bahasa
- Semua UI dalam Bahasa Indonesia.
- Format tanggal: `Sabtu, 12 Oktober 2026 · 19.00 WIB`.
- Format uang: `Rp 175.000` (titik sebagai pemisah ribuan).

---

## 9. Do's & Don'ts

### ✅ DO
- Gunakan token warna dari section 3.
- Pakai `font-body` (Inter) untuk 90% teks.
- Biarkan gambar dan poster mendominasi.
- Gunakan spacing kelipatan 4px.
- Selingi section gelap-terang di halaman travel.
- Test di mobile 375px dulu sebelum desktop.
- Sertakan empty state, loading state, error state.

### ❌ DON'T
- Jangan pakai gradient warna-warni.
- Jangan pakai glassmorphism (backdrop-blur putih).
- Jangan pakai emoji di heading.
- Jangan pakai font di luar daftar di section 4.1.
- Jangan pakai merah untuk teks di atas background gelap.
- Jangan pakai hijau untuk tombol aksi.
- Jangan animasikan `width`/`height`/`top`/`left`.
- Jangan hardcode warna hex di JSX.
- Jangan campur varian cinema & storytelling dalam satu section.
- Jangan pakai shadow lebih dari yang didefinisikan di section 5.5.

---

## 10. Referensi Cepat

| Butuh… | Lihat section |
|---|---|
| Warna | 3 |
| Font & ukuran | 4 |
| Spacing & breakpoint | 5 |
| Motion | 6 |
| Tampilan komponen | 7 |
| Aksesibilitas | 8 |
| Aturan varian halaman | 2 |

---

**Versi:** 1.0
**Terakhir diperbarui:** [tanggal]
**Pemilik:** Tim NGABINTON
