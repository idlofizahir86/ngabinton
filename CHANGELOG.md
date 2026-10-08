# `CHANGELOG.md`

# CHANGELOG — NGABINTON

> **Log semua perubahan penting di project ini.**
> Agent WAJIB menambah entry setiap selesai task di `TASK.md`.
> Format mengikuti [Keep a Changelog](https://keepachangelog.com/) + [Semantic Versioning](https://semver.org/).

---

## 0. Ringkasan Cepat (TL;DR)

```yaml
Format:       Keep a Changelog
Versioning:   Semantic Versioning (MAJOR.MINOR.PATCH)
Bahasa:       Indonesia (deskripsi), Inggris (tag)
Kategori:     Added, Changed, Deprecated, Removed, Fixed, Security
Aturan:       Update setiap selesai task, jangan borong di akhir
```

---

## 1. Cara Pakai File Ini

### 1.1 Kapan Update?

Setiap selesai task di `TASK.md`:
1. Buka file ini
2. Cari section `[Unreleased]` di paling atas
3. Tambah baris di kategori yang sesuai (Added / Changed / Fixed / dll)
4. Format: `- **{ID Task}**: deskripsi singkat`

**Jangan** update `CHANGELOG.md` hanya saat rilis besar. Update terus-menerus.

### 1.2 Kategori

| Kategori | Kapan dipakai |
|---|---|
| **Added** | Fitur baru |
| **Changed** | Perubahan pada fitur yang sudah ada |
| **Deprecated** | Fitur yang akan dihapus (tapi masih ada) |
| **Removed** | Fitur yang dihapus |
| **Fixed** | Bug fix |
| **Security** | Perbaikan security/vulnerability |

### 1.3 Format Versioning

`MAJOR.MINOR.PATCH`

- **MAJOR** — breaking change (mis. ganti framework)
- **MINOR** — fitur baru, backward-compatible
- **PATCH** — bug fix

**Untuk MVP:** semua masih `0.x.y` sampai production release pertama.

---

## 2. Version History

<!-- Tambahkan entry baru di ATAS, jangan di bawah -->

## [Unreleased]

### Added
- **PLAN**: Aset referensi brand `_ref/` (logo + desain jersey NGABINTON)
- **M0-01**: Scaffold Next.js 15.5.27 + TypeScript (strict) + Tailwind CSS v4.3.3 + pnpm (App Router, `src/`); script `typecheck`; `.gitignore` mengizinkan `.env.example`
- **M0-02**: Supabase project aktif; kredensial di `.env.local`; verifikasi konektivitas DB/REST/Upstash lolos
- **M0-03**: `AUTH_SECRET` di-generate; `DATABASE_URL` diperbaiki ke transaction pooler (6543) + `sslmode=require`
- **M0-04**: Dependency runtime & dev terpasang (drizzle, postgres, jose, bcryptjs, qrcode, html5-qrcode, zod, date-fns, lucide-react, supabase-js, upstash, sharp; drizzle-kit, tsx); `pnpm.onlyBuiltDependencies` diset
- **M0-05**: `drizzle.config.ts` + `src/lib/db/client.ts` (postgres.js, `prepare: false`) + `src/lib/db/schema.ts` (kosong); script `db:*` di `package.json`
- **M0-06**: 8 tabel + 4 enum + relations didefinisikan di `src/lib/db/schema.ts` (252 baris)
- **M0-07**: Migration `drizzle/0000_wise_squadron_supreme.sql` digenerate & di-push ke Supabase (8 tabel + 4 enum)
- **M0-02**: Storage bucket `public` dibuat via SQL; **Realtime dibatalkan** — counter kehadiran pakai Server SSE (ADR-010); RLS diaktifkan di 8 tabel (tanpa policy)
- **M0-08**: `scripts/seed.ts` (idempoten) + `scripts/hash-password.ts`; admin + event fixture `lanjalan-vol-1` (rundown 6, budget 6+TOTAL, extras 5) ter-seed
- **M1-01**: `src/lib/auth/jwt.ts` — `signSession`/`verifySession` (jose, HS256, exp 7 hari)
- **M1-02**: `src/lib/auth/password.ts` — `hashPassword`/`comparePassword` (bcryptjs, cost 10)
- **M1-03**: `src/lib/auth/session.ts` — `getSession`/`setSessionCookie`/`clearSessionCookie` (cookie `session`)
- **M1-04**: `loginAction` + `lib/validators/auth.ts` + `lib/api/users.ts`; signature `useActionState` diselaraskan di RULES/ROUTES
- **M1-05**: Halaman `/login` + `LoginForm`; primitives `Button`/`Input`/`Label`; `cn` helper
- **M2-01/02/03**: Font `next/font`, token desain Tailwind v4 `@theme`, komponen `<Container />` (ditarik ke depan untuk M1-05)
- **M1-06**: `src/lib/auth/rate-limit.ts` (Upstash Redis, 5/5 menit/IP) + integrasi di `loginAction` (fail closed)
- **M1-07**: `src/middleware.ts` proteksi `/admin/*` (redirect `/login?redirect=...`); `src/lib/constants.ts`; param `redirect` diaktifkan end-to-end
- **M1-08**: `logoutAction` (clear cookie + redirect `/login`) — milestone M1 selesai
- **M2-04**: `<Navbar />` (transparan→solid saat scroll, Sheet mobile) + primitif `<Sheet />`
- **M2-05**: `<Footer />` (3 kolom + baris bawah)
- **M2-06**: Layout `(public)` (Navbar+Footer) + landing dipindah ke `app/(public)/` — milestone M2 selesai
- **M3-01**: `src/lib/types/event.ts` (tipe dari schema) + `src/lib/fixtures/events.ts` (fixture 1 travel)
- **M3-02**: `src/lib/api/events.ts` — `getUpcomingEvents` (dengan fallback fixture saat DB kosong)
- **M3-03**: `<EventCard />`; `src/lib/utils/format.ts` (Intl, WIB) & `event-status.ts`; `<EventStatusBadge />` (M3-05)
- **M3-04**: `<EventCarousel />` (scroll+snap, panah hover, gradient fade tepi, empty state)
- **M3-06**: Hero landing (judul display, tagline, 2 CTA, overlay gradient); `buttonClass()` di `ui/button.tsx`
- **M3-07**: Section landing (Event Mendatang + Arsip Lan Jalan), `getPastTravelEvents`, ISR 60s; **milestone M3 selesai**
- **M4-01**: `getEventBySlug` (relasi lengkap) + tipe `EventDetail` di `src/lib/api/events.ts`
- **M4-02**: Halaman `/[slug]` — fetch + `notFound()` + `generateMetadata` (title/description/OG), ISR 60s; `APP_URL` + `metadataBase` untuk resolve OG absolut
- **M4-03**: `<EventHero />` (varian cinema) + `<EventMetaBar />` (M4-04, ditarik ke depan); `getVolumeLabel` diekstrak ke `src/lib/utils/event-label.ts`; halaman `/[slug]` memilih hero berdasarkan `theme`
- **M4-05**: `<RundownTimeline />` (varian cinema + storytelling, `highlightNow`, badge "Opsional")
- **M4-06**: `<EventSubNav />` (client, sticky `top-16`, scroll-spy IntersectionObserver, sembunyi di hero & `#absen`); `html { scroll-behavior: smooth }` di `globals.css`
- **M4-07**: Section `#rundown` di halaman `/[slug]` (wire `<RundownTimeline />` + `<EventSubNav />`, anchor `#hero`/`#rundown`)
- **M4-08**: Section `#biaya` versi minimal (judul + deskripsi + total `/ orang`) & anchor `#biaya`; full version menyusul di M5-05 (`<BudgetTable />`)
- **M4-09**: Halaman `/arsip` (ISR 300s) — grid semua event lewat via `getPastEvents`; `EventCard` dapat ukuran `fill` untuk grid. **Milestone M4 selesai**
- **M5-01**: `<QuranQuote />` (`id="pembuka"`, ayat RTL + terjemahan + source) & `src/lib/validators/event-extras.ts` (Zod `quranVerseSchema`, `getEventExtra()`)
- **M5-02**: `<StoryNarrative />` (blok narasi grid 60/40, `direction` kiri/kanan, gambar `aspect-video` + `shadow-story`)
- **M5-09**: Seed `event_media` (5 baris: destination, transport, food ×2, participant) supaya gambar section event tersedia dari DB; aset `public/` (19 file) masuk repo
- **M5-03**: `<DestinationCard />` (gambar kiri/konten kanan, region `story-teal`, badge durasi, tombol "Buka di Maps"); `<Button />` dapat variant **`story-primary`** & **`story-ghost`** (DESIGN §7.16)
- **M5-04**: `<TransportCard />` (ikon kendaraan, daftar titik jemput dengan dot `story-orange`, foto 16:9) + `pickupPointsSchema`
- **M5-05**: `<BudgetTable />` (tabel `#`/Item/Jumlah, blok TOTAL, kartu info pembayaran) + `paymentInfoSchema` yang **menolak nilai `[PLACEHOLDER: ...]`**; section `#biaya` final menggantikan placeholder M4-08

### Changed
- **PLAN**: `COMPONENTS.md` §3.1 `<EventHero />` — CTA utama dipetakan per `status` (upcoming → "Lihat Rundown", live → "Presensi Sekarang", past → "Lihat Dokumentasi"); "Daftar Sekarang" dihapus karena belum ada alur pendaftaran
- **PLAN**: Resolusi konflik `.md` pra-M0 — tanggal event `2026-10-10`, rate limit login 5 menit, logger `lib/utils/logger.ts`, stack tambah Upstash Redis + `sharp` + `@dnd-kit`, fixture event cukup 1 travel, seed M0-08 sekalian fixture, peserta via AI-generated (aturan hijab/base layer/jersey)
- **PLAN**: Semua `[TBD]` di `CONTENT.md` diisi — kuota (placeholder), info pembayaran (placeholder PIC Bu Triii), Maps Pawon, foto (AI-generated), sosmed (placeholder), checklist §10 ditutup
- **PLAN**: Melengkapi `SCHEMA.md` yang terpotong — kode tabel `attendance_sessions`, tabel `attendances` (§3.8), Relations (§4), Query Helpers (§5); memperbaiki referensi section `ARCHITECTURE.md` → `RULES.md`/`SETUP.md` di `TASK.md`; merapikan §7 `CONTENT.md`

### Fixed
- **M5-01**: Kontras `#rundown` — varian storytelling (teks `story-text` hampir hitam) sempat dipakai di atas latar gelap sehingga judul tak terbaca. Sekarang `#rundown` selalu varian cinema + teks putih (`DESIGN.md` §2: "Rundown (gelap, kontras)"); `#biaya` (storytelling) diberi latar `story-bg`

### Security
- _(belum ada)_

---

## [0.1.0] — 2026-10-08

Rilis pertama. Fondasi project: setup, auth, layout, landing, event page, presensi, admin.

### Added
- **M0**: Setup project Next.js 15 + TypeScript + pnpm
- **M0**: Konfigurasi Drizzle ORM + Supabase
- **M0**: 8 tabel database (users, events, rundown_items, budget_items, event_media, event_extras, attendance_sessions, attendances)
- **M0**: Seed script untuk admin & event fixture
- **M1**: Auth dengan JWT cookie + bcrypt
- **M1**: Halaman login admin
- **M1**: Middleware proteksi `/admin/*`
- **M1**: Rate limiting login (Upstash Redis)
- **M2**: Layout publik (navbar, footer, container)
- **M2**: Setup font (Anton, Inter, Caveat, Noto Naskh Arabic, JetBrains Mono)
- **M2**: Design token di `globals.css`
- **M3**: Landing page dengan hero + carousel event
- **M3**: Komponen EventCard, EventCarousel, EventStatusBadge
- **M4**: Halaman event `/[slug]`
- **M4**: Komponen EventHero, EventMetaBar, RundownTimeline, EventSubNav
- **M4**: Halaman arsip `/arsip`
- **M5**: Komponen storytelling (QuranQuote, StoryNarrative, DestinationCard, TransportCard, BudgetTable, GiftExchangeInfo, ParticipantGrid, ClosingMessage)
- **M5**: Integrasi storytelling di halaman travel
- **M6**: Form presensi peserta
- **M6**: Komponen AttendanceForm, AttendanceSuccess, AttendanceDuplicate
- **M7**: Admin dashboard (statistik + quick actions)
- **M7**: Admin event management (list, create, edit, delete)
- **M7**: Komponen StatCard, EventTable, EventForm
- **M8**: Generate QR code presensi
- **M8**: Halaman admin QR (`/admin/events/[id]/qr`)
- **M8**: Realtime attendance counter (Supabase Realtime)
- **M9**: Tabel kehadiran admin
- **M9**: Export CSV kehadiran
- **M9**: SSE stream untuk counter
- **M10**: Loading states, error pages, empty states
- **M10**: Accessibility improvements (focus ring, alt text, kontras)
- **M10**: SEO (metadata, sitemap, robots, OG image)
- **M11**: Deploy ke Vercel

### Changed
- _(rilis pertama, tidak ada perubahan)_

### Fixed
- _(rilis pertama, tidak ada fix)_

### Security
- **M1**: Rate limit login (5 percobaan / 15 menit)
- **M1**: Session cookie httpOnly + Secure + SameSite=Lax
- **M6**: Rate limit submit presensi (5/menit per IP)
- **M6**: IP hash (SHA-256) untuk anti-duplikat, bukan simpan IP mentah

---

## 3. Template Entry Baru

Copy template ini setiap kali mau tambah entry:

```md
## [Unreleased]

### Added
- **{ID Task}**: deskripsi singkat
- **{ID Task}**: deskripsi singkat

### Changed
- **{ID Task}**: deskripsi perubahan

### Deprecated
- **{ID Task}**: fitur yang akan dihapus

### Removed
- **{ID Task}**: fitur yang dihapus

### Fixed
- **{ID Task}**: bug yang diperbaiki

### Security
- **{ID Task}**: perbaikan security
```

**Aturan penulisan:**
- Bahasa Indonesia
- Kalimat aktif ("Menambah halaman X", bukan "Halaman X ditambahkan")
- Deskripsi singkat, maksimal 1 baris
- Selalu prefix ID task (`M0-01`, dll)
- Kalau task tidak ada ID, pakai prefix kategori (`[Admin]`, `[Public]`, `[DB]`)

---

## 4. Contoh Entry Realistis

**Skenario:** Selesai task M4-05 (buat RundownTimeline).

### Added
```md
- **M4-05**: Komponen `<RundownTimeline />` dengan variant cinema & storytelling
```

**Skenario:** Fix bug duplikat presensi tidak terdeteksi.

### Fixed
```md
- **M6-04**: Fix bug duplikat presensi saat nomor HP pakai format `+62`
```

**Skenario:** Upgrade Next.js 15.0 → 15.1.

### Changed
```md
- **CHORE**: Upgrade Next.js 15.0 → 15.1
```

---

## 5. Rilis & Tag

### 5.1 Kapan Rilis Version Baru?

- Rilis **0.1.0** — setelah M11 (deploy pertama)
- Rilis **0.2.0** — setelah fitur baru signifikan (mis. event badminton aktif)
- Rilis **1.0.0** — setelah stabil dan dipakai rutin oleh komunitas

### 5.2 Cara Rilis

1. Ubah `[Unreleased]` → `[0.x.y] — YYYY-MM-DD`
2. Tambah section `[Unreleased]` kosong di atas
3. Commit: `chore: release v0.x.y`
4. Tag: `git tag -a v0.x.y -m "Release 0.x.y"`
5. Push: `git push origin main --tags`

### 5.3 Format Tanggal

`YYYY-MM-DD` (ISO 8601). Contoh: `2026-11-15`.

---

## 6. Referensi Cepat

| Butuh… | Lihat |
|---|---|
| Task selanjutnya | `TASK.md` |
| Aturan agent | `AGENTS.md` |
| Kontribusi guide | `SETUP.md` |

---

**Versi:** 1.0
**Terakhir diperbarui:** [tanggal]
**Pemilik:** Tim NGABINTON