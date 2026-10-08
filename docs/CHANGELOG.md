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

### Changed
- **PLAN**: Resolusi konflik `.md` pra-M0 — tanggal event `2026-10-10`, rate limit login 5 menit, logger `lib/utils/logger.ts`, stack tambah Upstash Redis + `sharp` + `@dnd-kit`, fixture event cukup 1 travel, seed M0-08 sekalian fixture, peserta via AI-generated (aturan hijab/base layer/jersey)
- **PLAN**: Semua `[TBD]` di `CONTENT.md` diisi — kuota (placeholder), info pembayaran (placeholder PIC Bu Triii), Maps Pawon, foto (AI-generated), sosmed (placeholder), checklist §10 ditutup
- **PLAN**: Melengkapi `SCHEMA.md` yang terpotong — kode tabel `attendance_sessions`, tabel `attendances` (§3.8), Relations (§4), Query Helpers (§5); memperbaiki referensi section `ARCHITECTURE.md` → `RULES.md`/`SETUP.md` di `TASK.md`; merapikan §7 `CONTENT.md`

### Fixed
- _(belum ada)_

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