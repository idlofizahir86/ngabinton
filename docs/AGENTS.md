# `AGENTS.md`

# NGABINTON — Agent Instructions

> **Baca file ini SETIAP KALI memulai sesi baru, sebelum menulis kode apapun.**
> File ini adalah kontrak kerja antara kamu (AI agent) dan tim NGABINTON.
> Melanggar aturan di sini = kerjaan di-reject.

---

## 0. Konteks Proyek

**NGABINTON** adalah komunitas badminton mingguan yang juga mengadakan event
travel bareng (contoh: "Lan Jalan Vol. 1" ke Walini Hot Spring).

Website ini berfungsi sebagai:
1. **Landing page** bergaya Netflix — menampilkan event mendatang, arsip, dan galeri
2. **Halaman event** per-slug (contoh: `/lanjalan-vol-1`) — berisi rundown,
   destinasi, biaya, dan **sistem presensi QR**
3. **Admin dashboard** (protected) — untuk generate QR, pantau kehadiran, export CSV

**Filosofi produk:** konten adalah bintang, UI menghilang. Setiap pixel melayani
navigasi atau informasi. Tidak ada dekorasi tanpa tujuan.

---

## 1. Stack (LOCKED)

Jangan ganti, tambah, atau kurangi tanpa instruksi eksplisit dari manusia.

| Concern | Pilihan | Catatan |
|---|---|---|
| Framework | **Next.js 15 App Router** | RSC + Server Actions |
| Bahasa | **TypeScript strict** | `noImplicitAny: true`, no `any` |
| Styling | **Tailwind CSS v4** | Token dari `DESIGN.md` saja |
| UI Primitives | **shadcn/ui** | Hanya primitives, styling custom via token |
| Database | **Postgres (Supabase)** | Pooler wajib untuk Vercel |
| ORM | **Drizzle** | Bukan Prisma, bukan raw SQL |
| Auth | **JWT cookie (jose) + bcryptjs** | TANPA NextAuth, TANPA Clerk |
| QR Generate | **`qrcode`** | Server-side, output PNG/data URL |
| QR Scan | **`html5-qrcode`** | Client-side, hanya di halaman absen |
| Validasi | **Zod** | Semua input user wajib |
| Animasi | **Framer Motion** (kalau perlu) | Maksimum 1–2 komponen |
| Icons | **lucide-react** | Jangan campur dengan icon set lain |
| Realtime | **Supabase Realtime** | Counter kehadiran (admin QR) |
| File Storage | **Supabase Storage** | Poster & foto event |
| Rate Limit | **Upstash Redis** | Login & submit presensi |
| Image Processing | **`sharp`** | Konversi WebP (server) |
| Drag & Drop | **`@dnd-kit`** | Editor rundown admin (M7) |
| Font | **Anton** (display) + **Inter** (body) | Via `next/font` |
| Deploy | **Vercel** | — |

**Tidak dipakai:** Redux, Zustand, tRPC, Prisma, NextAuth, styled-components,
Material UI, Chakra, Bootstrap, jQuery, moment.js, lodash, axios.

---

## 2. Urutan Baca File (WAJIB)

Setiap sesi baru, baca **berurutan** sebelum ngoding:

1. **`AGENTS.md`** (file ini) — aturan main
2. **`TASK.md`** — cek task mana yang sedang dikerjakan
3. File spesifik sesuai task:
   - Bikin UI → `DESIGN.md` + `COMPONENTS.md`
   - Bikin route → `ROUTES.md`
   - Bikin data/fetch → `SCHEMA.md` + `CONTENT.md`
   - Bikin logic/form → `RULES.md` + `ARCHITECTURE.md`
   - Setup awal → `SETUP.md` + `.env.example`

**Jangan improvisasi.** Kalau ada yang tidak jelas di file-file di atas,
**tanya dulu** di komentar, jangan asal putuskan.

---

## 3. Aturan Wajib

### 3.1 Desain
1. **SEMUA warna, spacing, font, radius, shadow harus dari token di `DESIGN.md`.** Tidak boleh hardcode `#e50914` di JSX — pakai class Tailwind (`bg-primary`) atau CSS variable.
2. Halaman event travel (`lanjalan-vol-1`, dst) menggunakan **varian storytelling** dari `DESIGN.md` section 10. Halaman lain pakai varian cinema (dark).
3. Setiap komponen UI baru → update `COMPONENTS.md` dulu, baru coding.
4. Kalau butuh komponen yang tidak ada di `COMPONENTS.md`, **buat entri di sana dulu**, baru implementasi.

### 3.2 Kode
5. **Server Component dulu.** Baru tambah `"use client"` kalau butuh state/event handler/browser API.
6. Semua fetch data lewat `lib/api/` — jangan fetch langsung di komponen.
7. Semua Server Action dan Route Handler wajib **validasi Zod** untuk input.
8. Semua tipe data di `lib/types/` — jangan inline `type` di komponen kalau dipakai >1 tempat.
9. Nama file: `kebab-case.tsx` (`event-card.tsx`, `rundown-timeline.tsx`).
10. Nama komponen: `PascalCase` (`EventCard`, `RundownTimeline`).
11. Nama variable/fungsi: `camelCase`. Konstanta: `SCREAMING_SNAKE_CASE`.
12. Satu file maksimum **300 baris**. Lewat itu → pecah.
13. Tidak ada `console.log` yang tertinggal. Pakai `lib/utils/logger.ts` kalau butuh log.

### 3.3 Teks & Konten
14. **Semua teks UI dalam Bahasa Indonesia.** Tidak ada "Loading..." → "Memuat...", "Submit" → "Kirim".
15. Tidak ada placeholder "Lorem ipsum". Kalau butuh dummy text, ambil dari `CONTENT.md` atau `lib/fixtures/`.
16. Tidak ada "Coming soon", "TODO", atau tombol mati yang tidak di `TASK.md`.
17. Angka & tanggal format Indonesia: `Rp 175.000`, `Sabtu, 12 Oktober 2026 · 19.00 WIB`.

### 3.4 Git & Update File
18. Setiap selesai task, **update `TASK.md`** — centang task + tanggal + catatan singkat.
19. Setiap ada perubahan penting, **update `CHANGELOG.md`**.
20. Satu task, satu commit. Pesan commit: `feat(travel): add RundownTimeline variant story`.

---

## 4. Anti-Slop: Yang DILARANG KERAS

Ini penyebab kerjaan di-reject. Baca dua kali.

### 4.1 Visual
- ❌ Gradient warna-warni (ungu-biru, pink-oranye, dst) — hanya gradient hitam untuk overlay
- ❌ Glassmorphism (backdrop-blur putih transparan) — tidak sesuai tema
- ❌ Neon glow, drop-shadow berwarna, outer-glow
- ❌ Emoji di heading/judul section (boleh di isi konten kalau diminta)
- ❌ Ilustrasi 3D, clipart, sticker
- ❌ Font dekoratif selain Anton & Inter
- ❌ Warna di luar token `DESIGN.md`
- ❌ Animasi yang mengganggu: bounce, wiggle, shake, rotate loop
- ❌ Card dengan border-radius > 20px kecuali pill badge

### 4.2 Kode
- ❌ `any` di TypeScript — pakai `unknown` + Zod parse
- ❌ `as` type assertion tanpa komentar kenapa
- ❌ Fetch langsung di komponen (`useEffect` + `fetch`)
- ❌ `useState` untuk data yang bisa diturunkan dari props
- ❌ Duplikasi komponen (cek `COMPONENTS.md` dulu)
- ❌ File > 300 baris
- ❌ Nested ternary > 2 level
- ❌ Magic number (`if (x > 42)`) — pakai konstanta bernama
- ❌ Try-catch kosong
- ❌ Komen `// TODO` tanpa nomor task

### 4.3 Konten
- ❌ Lorem ipsum, "test", "foo", "bar", "asdf"
- ❌ Placeholder "Nama Event", "Deskripsi Event" — pakai konten asli dari `CONTENT.md`
- ❌ Teks Inggris di UI (kecuali istilah teknis seperti "QR Code", "CSV", "email")
- ❌ Tombol yang tidak melakukan apa-apa
- ❌ Halaman kosong tanpa empty state

### 4.4 Proses
- ❌ Install library baru tanpa alasan eksplisit di `ARCHITECTURE.md`
- ❌ Mengubah skema DB tanpa update `SCHEMA.md`
- ❌ Mengubah route tanpa update `ROUTES.md`
- ❌ Membuat komponen tanpa update `COMPONENTS.md`
- ❌ "Refactor sekalian" saat mengerjakan task lain — satu task, satu tujuan

---

## 5. Cara Kerja (Workflow)

### 5.1 Setiap Memulai Task
```
1. Baca TASK.md → ambil task paling atas yang belum selesai
2. Baca file referensi sesuai jenis task (lihat section 2)
3. Kalau butuh komponen baru → tambah dulu ke COMPONENTS.md
4. Kalau butuh route baru → tambah dulu ke ROUTES.md
5. Kalau butuh field DB baru → tambah dulu ke SCHEMA.md
6. Baru coding
```

### 5.2 Setelah Selesai Task
```
1. Test manual: buka di browser, cek semua state (loading, empty, error, success)
2. Cek responsif: 375px, 768px, 1280px
3. Update TASK.md → centang + tanggal
4. Update CHANGELOG.md → tambah entry
5. Kalau ada perubahan struktur → update file .md terkait
```

### 5.3 Kalau Ragu
- **Jangan menebak.** Tulis pertanyaan di komentar kode dengan prefix `// QUESTION:` atau tanya langsung ke manusia.
- Kalau ada konflik antar file `.md`, ikuti urutan prioritas: `AGENTS.md` > `RULES.md` > `SCHEMA.md` > `ROUTES.md` > `COMPONENTS.md` > `DESIGN.md` > `CONTENT.md`.
- Kalau task tidak ada di `TASK.md`, **jangan kerjakan**. Tambah dulu ke `TASK.md`, minta konfirmasi.

---

## 6. Konvensi Penamaan

### File & Folder
```
src/app/(public)/[slug]/page.tsx       → route publik
src/app/(admin)/admin/events/page.tsx  → route admin (protected)
src/app/api/attendance/route.ts        → route handler
src/components/ui/button.tsx           → primitive (dumb)
src/components/event/event-card.tsx    → fitur event
src/components/presensi/qr-display.tsx → fitur presensi
src/lib/db/schema.ts                   → schema drizzle
src/lib/api/events.ts                  → wrapper fetch internal
src/lib/auth/session.ts                → helper auth
src/lib/validators/attendance.ts       → zod schema
src/lib/fixtures/events.ts             → mock data untuk dev
```

### Export
```ts
// Default export: untuk page/layout (wajib, Next.js)
export default function EventPage() {}

// Named export: untuk komponen, helper, tipe
export function EventCard() {}
export type Event = z.infer<typeof eventSchema>;
```

### Database
- Nama tabel: `snake_case` plural (`events`, `rundown_items`)
- Nama kolom: `snake_case` (`created_at`, `session_code`)
- Foreign key: `{table_singular}_id` (`event_id`, `session_id`)
- Timestamp: `timestamptz` dengan default `now()`

---

## 7. Struktur Folder Referensi

```
ngabinton/
├── AGENTS.md              ← kamu di sini
├── TASK.md
├── DESIGN.md
├── ARCHITECTURE.md
├── SCHEMA.md
├── ROUTES.md
├── COMPONENTS.md
├── CONTENT.md
├── RULES.md
├── SETUP.md
├── BRAND.md
├── CHANGELOG.md
├── .env.example
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── styles/
├── public/
│   └── events/
│       └── lanjalan-vol-1/
└── scripts/
    └── seed.ts
```

---

## 8. Referensi Cepat

| Butuh… | Baca… |
|---|---|
| Tahu task selanjutnya | `TASK.md` |
| Warna/font/spacing | `DESIGN.md` |
| Struktur DB | `SCHEMA.md` |
| Alamat route | `ROUTES.md` |
| Komponen yang sudah ada | `COMPONENTS.md` |
| Copy & data event | `CONTENT.md` |
| Aturan bisnis (presensi, auth) | `RULES.md` |
| Keputusan teknis (kenapa X bukan Y) | `ARCHITECTURE.md` |
| Setup lokal & deploy | `SETUP.md` |
| Logo & tone of voice | `BRAND.md` |

---

## 9. Kontak & Eskalasi

Kalau ada pertanyaan yang tidak bisa dijawab dari file `.md`:
- **Tulis pertanyaan di `TASK.md`** di bawah task yang sedang dikerjakan, dengan prefix `❓ QUESTION:`
- **Jangan asal putuskan** untuk hal-hal yang menyangkut: skema DB, auth, biaya/harga, teks formal (ayat, sambutan), atau perubahan stack.
- Untuk hal kecil (nama variable, urutan props), boleh putuskan sendiri.

---

**Versi:** 1.0
**Terakhir diperbarui:** 2026-10-07
**Pemilik:** Tim NGABINTON

---