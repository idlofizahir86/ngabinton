# `CONTENT.md`

# CONTENT — NGABINTON

> **Sumber kebenaran untuk semua teks, data, dan angka di website.**
> Agent DILARANG mengarang teks. Kalau butuh konten baru, tulis dulu di sini,
> minta konfirmasi manusia, baru pakai.
> Semua yang TBD anda boleh tanyakan langsung tapi anda boleh menyesuaikan jadi placeholder

---

## 1. Brand

### 1.1 Identitas
- **Nama resmi:** NGABINTON
- **Kepanjangan (plesetan):** "Ngaji, Ngobrol, Badminton" (bisa berubah sesuai konteks event)
- **Tagline utama:** *"Ngaji, ngobrol, badminton — dan sesekali jalan-jalan yang pasti  99% HAHA HIHI."*
- **Tagline alternatif (event travel):** *"Ngabinton: bawa raket, bawa tawa, bawa angkot."*
- **Tahun berdiri:** 2025
- **Kota basis:** Bandung
- **Jumlah member aktif:** ~20

### 1.2 Deskripsi (untuk meta description & about)
**Versi pendek (≤155 karakter):**
> "Komunitas badminton mingguan yang suka kumpul, main bareng, dan sesekali jalan-jalan. Ngobrol, ngaji, ngabinton."

**Versi sedang (untuk hero landing):**
> "Kami bukan klub badminton biasa. Kami kumpul tiap minggu untuk main, ngobrol, dan kadang jalan-jalan bareng. Yang penting: seru, hangat, dan nggak drama."

### 1.3 Tone of Voice
- **Playful tapi sopan.** Boleh bercanda, tapi tidak kasar.
- **Hangat.** Seperti ngobrol dengan teman lama.
- **Bahasa gaul ringan.** "Nih", "yuk", "bareng", "nggak" — boleh. "Woy", "cuy", "anjir" — jangan.
- **Tidak kaku.** Hindari "Kami mengundang Anda untuk..." → pakai "Yuk ikutan...".
- **Religius secukupnya.** Boleh sisipkan ayat/nasihat, tapi tidak berkhotbah.

### 1.4 Microcopy Standar
| Konteks | Teks |
|---|---|
| Tombol utama | "Daftar Sekarang" / "Ikutan" / "Presensi Sekarang" |
| Tombol sekunder | "Lihat Detail" / "Selengkapnya" / "Baca Rundown" |
| Loading | "Memuat..." |
| Empty state event | "Belum ada event. Pantengin terus ya!" |
| Empty state presensi | "Belum ada yang absen. Jadi yang pertama!" |
| Error form | "Ada yang salah. Coba cek lagi ya." |
| Sukses presensi | "Kehadiran kamu tercatat. Sampai jumpa!" |
| Sesi ditutup | "Presensi sudah ditutup. Hubungi admin kalau belum tercatat." |
| Logout | "Sampai jumpa!" |

---

## 2. Navigasi

### 2.1 Menu Utama (Navbar Public)
| Label | Route | Catatan |
|---|---|---|
| Home | `/` | Logo juga link ke sini |
| Event | `/#events` atau `/arsip` | Scroll ke section event |
| Tentang | `/tentang` | — |
| Kontak | `/kontak` | — |
| Masuk | `/login` | Icon-only di mobile, teks di desktop |

### 2.2 Footer
**Kolom 1 — Brand:**
> NGABINTON
> Ngaji, ngobrol, badminton.
> Bandung

**Kolom 2 — Navigasi:**
- Event Mendatang
- Arsip Event
- Tentang Kami


**Baris bawah:**
> © 2026 NGABINTON. Dibuat sambil gabut oleh IT Palugada sembari ngantuk.

---

## 3. Landing Page (`/`)

### 3.1 Hero
- **Judul:** NGABINTON
- **Subjudul:** "Ngaji, ngobrol, badminton — dan sesekali jalan-jalan."
- **Deskripsi (2 baris):** "Komunitas badminton mingguan yang suka kumpul, main bareng, dan kadang jalan-jalan. Yuk ikutan!"
- **CTA utama:** "Lihat Event Terbaru" → scroll ke `#events`
- **CTA sekunder:** "Tentang Klub" → `/tentang`
- **Background:** Generate gambar AI,  foto komunitas terbaik menggunkan jersey seperti di folder referensi

### 3.2 Section: Event Mendatang
- **Judul:** "Event Mendatang"
- **Link kanan:** "Lihat semua →"
- **Konten:** carousel dari `events` where `is_published = true AND starts_at > now()`
- **Empty state:** "Belum ada event baru. Pantengin terus ya!"

### 3.3 Section: Arsip
- **Judul:** "Arsip Lan Jalan"
- **Link kanan:** "Lihat semua →"
- **Konten:** carousel dari `events` where `event_type = 'travel' AND is_published = true AND starts_at < now()`
- **Empty state:** (section disembunyikan kalau kosong)

### 3.4 Section: Galeri
- **Judul:** "Momen Kami"
- **Deskripsi:** "Beberapa momen dari kumpul-kumpul kami."
- **Konten:** grid foto dari `event_media`
- **Empty state:** (section disembunyikan kalau kosong)

### 3.5 Section: CTA Gabung
- **Judul:** "Mau Ikutan?"
- **Deskripsi:** "Nggak perlu jago badminton. Yang penting mau ketawa dan bawa semangat."
- **CTA:** "Hubungi Kami" → WhatsApp link

---

## 4. Halaman Event: Lan Jalan Vol. 1

**Slug:** `lanjalan-vol-1`
**URL:** `/lanjalan-vol-1`

> **Catatan visual:** Semua foto pada halaman ini (hero, transport, Pawon, peserta) = **AI-generated** mengikuti aturan `BRAND.md` §7.4 (jersey NGABINTON; karakter perempuan wajib hijab + base layer), kecuali dinyatakan lain.

### 4.1 Metadata Event
| Field | Nilai |
|---|---|
| `slug` | `lanjalan-vol-1` |
| `title` | Lan Jalan Vol. 1 |
| `subtitle` | Yuk Traveling — Walini Hot Spring, Ciwidey |
| `event_type` | `travel` |
| `theme` | `storytelling` |
| `starts_at` | 2026-10-10 |
| `meeting_point` | Vasati Rabbani |
| `meeting_time` | 06.00 WIB |
| `return_time` | 18.00 WIB |
| `transport_mode` | Angkot (sewa) |
| `price` | Rp 175.000 / orang |
| `quota` | 20 (placeholder — sesuaikan) |
| `hero_image` | `/events/lanjalan-vol-1/hero-walini.jpg` |
| `cover_image` | `/events/lanjalan-vol-1/cover-travel.jpg` |

### 4.2 Hero Section
- **Badge:** "Vol. 1"
- **Judul utama:** Lan Jalan Vol. 1
- **Subjudul:** Walini Hot Spring, Ciwidey
- **Metadata bar:** `2026-10-10` · 06.00–18.00 WIB · Angkot · Rp 175.000
- **CTA utama:** "Lihat Rundown" → `#rundown`
- **CTA sekunder:** "Presensi" → `#absen` (muncul hanya kalau sesi dibuka)

### 4.3 Section Pembuka — Ayat (#pembuka)
- **Arab:**
  > هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِنْ رِزْقِهِ ۖ وَإِلَيْهِ النُّشُورُ
- **Terjemahan:**
  > "Dialah yang menjadikan bumi untuk kamu yang mudah dijelajahi, maka jelajahilah di segala penjurunya dan makanlah sebagian dari rezeki-Nya. Dan hanya kepada-Nyalah kamu (kembali setelah) dibangkitkan."
- **Sumber:** Q.S Al Mulk : 15

### 4.4 Section Narasi (#narasi)
- **Judul:** "Rencana yang Telah Direncanakan"
- **Teks:**
  > "Begitu banyak rencana yang telah kita rencanakan, ingatkan kamu… lalu ini arahnya kemana???"
- **Visual:** Generate gambar AI, meme karakter lucu

### 4.5 Section Destinasi (#destinasi)
- **Judul:** "Destinasi"
- **Nama tempat:** Walini Hot Spring
- **Lokasi:** Ciwidey, Kabupaten Bandung
- **Deskripsi:**
  > "Pemandian air panas alami di kaki gunung, dikelilingi hutan pinus dan kebun teh. Cocok untuk berendam santai setelah perjalanan panjang naik angkot."
- **Image:** `/events/lanjalan-vol-1/dest-walini.jpg`
- **Durasi kunjungan:** 08.30 – 12.15 (≈ 3 jam 45 menit)
- **Google Maps:** https://share.google/7MTyzAyowSQePVniK

### 4.6 Section Transportasi (#transportasi)
- **Judul:** "Naik Apa?"
- **Mode:** Angkot (sewa)
- **Deskripsi:**
  > "Naik angkot sewaan bareng-bareng. Titik jemput utama di Vasati Rabbani, plus beberapa titik lain di sepanjang rute. Yang penting jangan telat, nanti ditinggal!"
- **Image:** `/events/lanjalan-vol-1/transport-angkot.jpg`
- **Titik jemput:**
  - Vasati Rabbani (titik utama)
  - Samsat Seokarno Hatta
  - Banjaran
  - Soreang

### 4.7 Section Rundown (#rundown)
- **Judul:** "Rundown"
- **Deskripsi:** "Perkiraan jadwal. Bisa geser sedikit tergantung kondisi jalan."

| Jam | Aktivitas | Catatan |
|---|---|---|
| 06.00 | Kumpul di Vasati Rabbani | Titik kumpul utama |
| 06.00 – 08.30 | Perjalanan menuju Walini Hot Spring | Plus penjemputan di beberapa titik |
| 08.30 – 12.15 | Eksplore Walini Hot Spring | Berendam dll |
| 12.15 – 14.30 | Makan siang di Pawon Kang Bima | Sekalian tukar kado (10K–15K) |
| 14.30 – 15.30 | Petik Stroberi | *Optional* |
| 15.30 – 18.00 | Perjalanan pulang | Ke rumah masing-masing yaa |

### 4.8 Section Makan Siang (#makan)
- **Judul:** "Makan Siang"
- **Nama tempat:** Pawon Kang Bima
- **Deskripsi:**
  > "Resto Sunda dengan view kebun teh. Menu yang kita pilih: Paket Nasi Liwet + telor + nugget (untuk Pak Azmi)."
- **Image:** `/events/lanjalan-vol-1/food-pawon.jpg`
- **Menu image (opsional):** `/events/lanjalan-vol-1/menu-pawon.jpg`
- **Google Maps:** https://share.google/ltOZPAbcD7mzxCf7f

### 4.9 Section Biaya (#biaya)
- **Judul:** "Biaya"
- **Deskripsi:** "Sudah termasuk semua. Tinggal bawa uang jajan tambahan buat oleh-oleh."

| # | Item | Jumlah |
|---|---|---|
| 1 | Angkot | Rp 50.000 |
| 2 | Tiket Walini Hot Spring | Rp 40.000 |
| 3 | Sewa Gazebo | Rp 10.000 |
| 4 | Makan Siang | Rp 50.000 |
| 5 | Tiket Petik Stroberi | Rp 10.000 |
| 6 | Lain-lain | Rp 15.000 |
| | **TOTAL** | **Rp 175.000** |

- **Catatan:** "Bayar ke Bu Triii maks 2026-10-10, belum bayar naik angkotnya di atas."
- **Info pembayaran** (`event_extras.payment_info` — **placeholder**, sesuaikan sebelum produksi):
  - `bank`: `[PLACEHOLDER: BCA / BRI / Mandiri / dst]`
  - `account_number`: `[PLACEHOLDER: 0000000000]`
  - `account_name`: Bu Triii (PIC)
  - `deadline`: 2026-10-10

### 4.10 Section Tukar Kado (#kado)
- **Judul:** "Tukar Kado"
- **Deskripsi:**
  > "Bawa satu kado, budget Rp 10.000 – Rp 15.000. Unisex, jadi nggak perlu bingung mau cowok atau cewek. Ditukar saat makan siang di Pawon Kang Bima."
- **Aturan:**
  - Budget: Rp 10.000 – Rp 15.000
  - Unisex (bebas gender)
  - Wajib bawa 1 kado per orang
  - Ditukar saat makan siang

### 4.11 Section Peserta (#peserta)
- **Judul:** "Yang Ikutan"
- **Deskripsi:** "Beberapa muka yang bakal nongkrong di angkot."
- **Image:** `/events/lanjalan-vol-1/participants-collage.jpg`
- **Catatan:** Foto peserta = **AI-generated** (disetujui).
  - Karakter perempuan **wajib pakai hijab + base layer**.
  - Pakaian mengikuti desain jersey NGABINTON (lihat `BRAND.md` §7.4, referensi `_ref/jersey_ngabinton.jpeg`).
  - Gaya: candid, hangat, bukan kartun/3D/clipart (lihat `BRAND.md` §7).

### 4.12 Section Presensi (#absen)
- **Judul:** "Presensi"
- **Deskripsi (sebelum dibuka):** "Presensi akan dibuka saat hari H. Pantengin ya!"
- **Deskripsi (dibuka):** "Scan QR di bawah atau masukkan kode manual."
- **CTA:** tombol "Presensi Sekarang" (primary)
- **Form fields:**
  - Nama lengkap (wajib)
  - Nomor HP (opsional)
  - Bawa kado? (checkbox: Ya / Belum)
- **Setelah submit (sukses):** "Kehadiran kamu tercatat. Sampai jumpa di angkot!"

### 4.13 Section Penutup (#penutup)
- **Judul (script font):** "See you in the ANGKOT!"
- **CTA:** "Lihat Event Lain" → `/arsip`

---

## 5. Halaman Admin

### 5.1 Login (`/login`)
- **Judul:** "Masuk Admin"
- **Subjudul:** "Khusus pengurus NGABINTON."
- **Field:**
  - Username (placeholder: "username")
  - Password (placeholder: "••••••••")
- **Tombol:** "Masuk"
- **Error invalid:** "Username atau password salah."
- **Error rate limit:** "Terlalu banyak percobaan. Coba lagi dalam 5 menit."

### 5.2 Dashboard (`/admin`)
- **Judul:** "Dashboard"
- **Sapaan:** "Halo, [nama admin]."
- **Statistik cards:**
  - Total event
  - Event aktif
  - Presensi hari ini
  - Total member
- **Aksi cepat:** "Buat Event Baru"

### 5.3 Daftar Event (`/admin/events`)
- **Judul:** "Kelola Event"
- **Tombol:** "+ Event Baru"
- **Kolom tabel:** Judul, Tipe, Tanggal, Status, Aksi
- **Empty state:** "Belum ada event. Bikin yang pertama yuk!"

### 5.4 Detail Event (`/admin/events/[id]`)
- **Tab:** Info | Rundown | Biaya | Media | Presensi
- **Aksi:** Edit, Hapus, Duplikat, Publikasi
- **Tombol besar:** "Buka Presensi" / "Tutup Presensi"

### 5.5 Halaman QR (`/admin/events/[id]/qr`)
- **Judul:** "QR Presensi"
- **Status badge:** "LIVE" (hijau, pulse) / "TUTUP" (abu)
- **Counter:** "X orang sudah hadir"
- **QR display:** ukuran 320×320, background putih
- **URL pendek:** `/e/[slug]/absen?code=XXXXXX`
- **Tombol:** "Refresh QR", "Unduh PNG", "Tutup Presensi"
- **Konfirmasi tutup:** "Yakin mau tutup presensi? Peserta yang belum absen nggak bisa masuk lagi."

### 5.6 Daftar Kehadiran (`/admin/events/[id]/attendance`)
- **Judul:** "Daftar Kehadiran"
- **Counter:** "X / Y orang"
- **Kolom:** #, Nama, Kontak, Bawa Kado, Waktu, Aksi
- **Filter:** Semua / Bawa Kado / Belum Bawa
- **Search:** by nama
- **Tombol:** "Download CSV"

### 5.7 Halaman Absen Peserta (`/[slug]/absen` atau `/e/[slug]/absen`)
- **Header:** "Presensi Lan Jalan Vol. 1"
- **Subheader:** "Isi data kamu untuk konfirmasi kehadiran."
- **Field:**
  - Nama lengkap — placeholder: "Nama kamu"
  - Nomor HP — placeholder: "08xx (opsional)"
  - Bawa kado? — checkbox: "Ya, saya bawa kado"
- **Tombol:** "Konfirmasi Kehadiran"
- **Sukses:** "Kehadiran kamu tercatat. Sampai jumpa di angkot!"
- **Duplikat:** "Kamu sudah tercatat hadir pada [waktu]."
- **Sesi ditutup:** "Presensi sudah ditutup. Hubungi admin kalau belum tercatat."

---

## 6. Data Fixture (untuk Dev)

Agent boleh pakai data di section ini untuk mock sebelum DB live.
Setelah DB live, **hapus fixture dan pakai data asli**.

### 6.1 Event Fixture
```ts
export const lanjalanVol1 = {
  slug: "lanjalan-vol-1",
  title: "Lan Jalan Vol. 1",
  subtitle: "Yuk Traveling — Walini Hot Spring, Ciwidey",
  eventType: "travel",
  theme: "storytelling",
  startsAt: "2026-10-10",
  meetingPoint: "Vasati Rabbani",
  meetingTime: "06.00 WIB",
  returnTime: "18.00 WIB",
  transportMode: "Angkot (sewa)",
  price: 175000,
  quota: null,
};
```

### 6.2 Rundown Fixture
```ts
export const rundownItems = [
  { time: "06.00", title: "Kumpul di Vasati Rabbani", note: "Titik kumpul utama" },
  { time: "06.00 – 08.30", title: "Perjalanan menuju Walini Hot Spring", note: "Plus penjemputan di beberapa titik" },
  { time: "08.30 – 12.15", title: "Eksplore Walini Hot Spring", note: "Berendam dll" },
  { time: "12.15 – 14.30", title: "Makan siang di Pawon Kang Bima", note: "Sekalian tukar kado (10K–15K)" },
  { time: "14.30 – 15.30", title: "Petik Stroberi", note: "Optional" },
  { time: "15.30 – 18.00", title: "Perjalanan pulang", note: "Ke rumah masing-masing yaa" },
];
```

### 6.3 Budget Fixture
```ts
export const budgetItems = [
  { label: "Angkot", amount: 50000 },
  { label: "Tiket Walini Hot Spring", amount: 40000 },
  { label: "Sewa Gazebo", amount: 10000 },
  { label: "Makan Siang", amount: 50000 },
  { label: "Tiket Petik Stroberi", amount: 10000 },
  { label: "Lain-lain", amount: 15000 },
];
export const budgetTotal = 175000;
```

---

## 7. Event Badminton (TBD)

Belum ada event badminton yang di-publish ke website. Kalau nanti ada:

**Field yang perlu diisi:**
- `slug` — mis. `badminton-vol-12`
- `title`
- `subtitle`
- `event_type` = `badminton`
- `theme` = `cinema` (default)
- `starts_at`, `location`, `price`
- `hero_image`

**Contoh struktur konten (placeholder):**
```md
### Metadata
- Slug: {placeholder: badminton-vol-12}
- Judul: {placeholder: Badminton Vol. 12}
- Tanggal: {placeholder}
- Lokasi: {placeholder}
- Biaya: {placeholder}

### Rundown
| Jam | Aktivitas | Catatan |
|---|---|---|
| {placeholder} | {placeholder} | {placeholder} |

### Peserta
{placeholder}
```

**Rule:** Kalau bikin event badminton, gunakan varian **cinema** (dark), bukan storytelling.
Varian storytelling hanya untuk event travel/jalan-jalan.

**Fixture dev:** cukup 1 event travel (`lanjalan-vol-1`) — jangan bikin event badminton dummy (keputusan pra-M0).

---

## 8. Kontak & Sosial

Siapkan Placeholder aja untuk ini
| Channel | Handle / Link |
|---|---|
| Instagram | `https://instagram.com/ngabinton` (placeholder) |
| WhatsApp Admin | `+62 8xx-xxxx-xxxx` (placeholder) |
| WhatsApp Group | `https://chat.whatsapp.com/xxxxxxxx` (placeholder) |
| Email | `hello@ngabinton.id` (placeholder) |
| TikTok | `https://tiktok.com/@ngabinton` (placeholder) |

---

## 9. Legal & Kredit

- **Ayat Al-Quran:** Terjemahan Kemenag RI (public domain).
- **Font:** Anton (SIL OFL), Inter (SIL OFL).
- **Icon:** Lucide (ISC License).
- **Foto:** Milik NGABINTON, tidak untuk dipakai komersial tanpa izin.

---

## 10. Checklist Konten (untuk manusia)

Sebelum agent dipakai bikin halaman event, pastikan item ini sudah diisi:

### Lan Jalan Vol. 1
- [x] Tanggal pasti event → **2026-10-10**
- [x] Kuota peserta → **20** (placeholder — sesuaikan)
- [x] Deadline pembayaran → **2026-10-10**
- [x] Nama & rekening PIC pembayaran → PIC **Bu Triii**; bank & no. rekening **placeholder** (§4.9)
- [x] Titik jemput lengkap → Vasati Rabbani, Samsat Seokarno Hatta, Banjaran, Soreang
- [x] Link Google Maps Walini → `https://share.google/7MTyzAyowSQePVniK`
- [x] Link Google Maps Pawon Kang Bima → `https://share.google/ltOZPAbcD7mzxCf7f`
- [x] Foto hero → AI-generated (jersey NGABINTON, `BRAND.md` §7.4)
- [x] Foto transport angkot → AI-generated
- [x] Foto Pawon → AI-generated
- [x] Foto kolase peserta → AI-generated (hijab + base layer + jersey NGABINTON)
- [x] Daftar nama peserta → **tidak ditampilkan** (privacy default, `RULES.md` §5.3)

### Umum
- [x] Tahun berdiri NGABINTON → 2025
- [x] Kota basis → Bandung
- [x] Jumlah member aktif → ~20
- [x] Handle sosmed → **placeholder** (§8)
- [x] Foto komunitas untuk hero landing → AI-generated (jersey NGABINTON)
- [x] Logo NGABINTON → `_ref/logo_ngabinton.png` (perlu diekspor ke SVG)

> **Keterangan:** item bertanda **(placeholder)** boleh dipakai untuk dev; ganti dengan nilai final sebelum deploy produksi (M11).

---

**Versi:** 1.0
**Terakhir diperbarui:** [tanggal]
**Pemilik:** Tim NGABINTON