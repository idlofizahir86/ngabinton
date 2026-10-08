# `TASK.md`

# TASK — NGABINTON

> **Backlog & progress tracker.**
> Agent WAJIB update file ini setiap selesai task.
> Cara pakai: ambil task paling atas yang belum selesai, kerjakan, centang, lanjut.
> Jangan kerjakan task yang tidak ada di sini tanpa update file ini dulu.

---

## 0. Ringkasan Cepat (TL;DR)

```yaml
Status:      🚧 In Progress
Milestone:   M0 — Setup
Progress:    0 / 87 tasks
Terakhir:    —

Aturan:
  - Satu task = satu sesi kerja
  - Update status + tanggal + catatan setiap selesai
  - Kalau butuh task baru, tulis di section "Backlog Baru" dulu
  - Jangan skip milestone — urutannya sudah dependency-ordered
```

---

## 1. Status Legend

| Simbol | Arti |
|---|---|
| `[ ]` | Belum dikerjakan |
| `[~]` | Sedang dikerjakan |
| `[x]` | Selesai |
| `[!]` | Blocked (ada catatan kenapa) |
| `[-]` | Dibatalkan / tidak jadi |

---

## 2. Milestones

| # | Milestone | Task | Target |
|---|---|---|---|
| M0 | Setup | 8 | Fondasi project |
| M1 | Auth | 6 | Login admin |
| M2 | Layout | 5 | Navbar + footer + container |
| M3 | Landing | 7 | Halaman utama |
| M4 | Event Public | 9 | Halaman `/[slug]` |
| M5 | Storytelling | 8 | Section khusus travel |
| M6 | Presensi Peserta | 6 | Form absen |
| M7 | Admin Dashboard | 8 | List & detail event |
| M8 | Admin QR | 7 | Generate & manage QR |
| M9 | Admin Attendance | 6 | Lihat & export kehadiran |
| M10 | Polish | 9 | Empty state, loading, error |
| M11 | Deploy | 8 | Production |

**Total: 87 task.**

---

## M0 — Setup 🚧

Target: fondasi project siap, DB connect, seed admin.

- [ ] **M0-01** Init Next.js 15 + TypeScript + pnpm
  - Command: `pnpm create next-app@latest ngabinton --typescript --tailwind --app --src-dir --import-alias "@/*"`
  - Hapus boilerplate default
- [ ] **M0-02** Setup Supabase project
  - Buat project di [supabase.com](https://supabase.com)
  - Copy `DATABASE_URL` (pooler), `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **M0-03** Setup `.env.local` + `.env.example`
  - Isi semua env var dari `SETUP.md` section 5
  - Generate `AUTH_SECRET` dengan `openssl rand -base64 32`
- [ ] **M0-04** Install dependencies
  ```bash
  pnpm add drizzle-orm postgres jose bcryptjs qrcode html5-qrcode zod date-fns lucide-react \
    @supabase/supabase-js @upstash/redis @upstash/ratelimit sharp
  pnpm add -D drizzle-kit @types/bcryptjs @types/qrcode tsx
  # @dnd-kit (editor rundown) baru perlu saat M7:
  # pnpm add @dnd-kit/core @dnd-kit/sortable
  ```
- [ ] **M0-05** Setup Drizzle config + schema kosong
  - Buat `drizzle.config.ts`
  - Buat `src/lib/db/client.ts`
  - Buat `src/lib/db/schema.ts` (import semua tabel — masih kosong)
- [ ] **M0-06** Tulis semua tabel di `schema.ts`
  - Referensi: `SCHEMA.md` section 3
  - 8 tabel: `users`, `events`, `rundown_items`, `budget_items`, `event_media`, `event_extras`, `attendance_sessions`, `attendances`
  - Plus 4 enum
- [ ] **M0-07** Generate & apply migration pertama
  - `pnpm drizzle-kit generate`
  - `pnpm drizzle-kit push`
- [ ] **M0-08** Seed admin + fixture event
  - Buat `scripts/seed.ts`
  - Seed: 1 admin user + event `lanjalan-vol-1` + rundown (6 item) + budget (6 item + baris TOTAL) + extras
  - Jalankan `pnpm tsx scripts/seed.ts`
  - Verifikasi: tabel `users` ada 1 baris; tabel `events` ada `lanjalan-vol-1`

**Catatan M0:**
- Belum ada UI apapun. Fokus fondasi.
- Setelah M0, project bisa jalan (`pnpm dev`) tapi hanya nampilkan halaman blank.

---

## M1 — Auth

Target: admin bisa login & logout, dashboard protected.

- [ ] **M1-01** Buat `lib/auth/jwt.ts`
  - `signSession(payload)` → string
  - `verifySession(token)` → payload \| null
  - Referensi: `RULES.md` section 1.2
- [ ] **M1-02** Buat `lib/auth/password.ts`
  - `hashPassword(plain)` → string
  - `comparePassword(plain, hash)` → boolean
- [ ] **M1-03** Buat `lib/auth/session.ts`
  - `getSession()` → payload \| null (baca dari cookie)
  - `setSessionCookie(token)`
  - `clearSessionCookie()`
- [ ] **M1-04** Buat `actions/auth.ts` — `loginAction`
  - Validasi Zod
  - Query user by username
  - `comparePassword`
  - Sign JWT + set cookie
  - Update `last_login_at`
  - Rate limit check (skip dulu, implement di M1-06)
- [ ] **M1-05** Buat halaman `/login`
  - File: `app/(admin)/login/page.tsx`
  - Form: username + password + tombol "Masuk"
  - Pakai `useFormState` untuk handle response
  - Referensi: `CONTENT.md` section 5.1
- [ ] **M1-06** Setup rate limit login (Upstash Redis)
  - Buat `lib/auth/rate-limit.ts`
  - Limit: 5 percobaan / 15 menit / IP
  - Referensi: `RULES.md` section 9
- [ ] **M1-07** Buat `middleware.ts`
  - Matcher: `/admin/:path*`
  - Verify JWT, redirect ke `/login` kalau invalid
  - Referensi: `RULES.md` section 1.3
- [ ] **M1-08** Buat `actions/auth.ts` — `logoutAction`
  - Clear cookie
  - Redirect `/login`

**Catatan M1:**
- Setelah M1, akses `/admin` (belum ada halaman) akan redirect ke `/login`.
- Login sukses → redirect ke `/admin` (yang akan 404 dulu, itu OK).

---

## M2 — Layout

Target: kerangka visual (navbar, footer, container) siap dipakai.

- [ ] **M2-01** Setup font di `app/layout.tsx`
  - Anton (display), Inter (body), Caveat (script), Noto Naskh Arabic, JetBrains Mono
  - Pakai `next/font/google`
- [ ] **M2-02** Setup token warna di `globals.css`
  - CSS variables untuk semua token di `DESIGN.md` section 0
  - Map ke Tailwind via `@theme` (Tailwind v4)
- [ ] **M2-03** Buat `<Container />`
  - File: `src/components/layout/container.tsx`
  - Props: `size` (sm/md/lg/xl/full), `as`
  - Referensi: `COMPONENTS.md` section 2.1
- [ ] **M2-04** Buat `<Navbar />`
  - File: `src/components/layout/navbar.tsx`
  - Behavior: transparan → solid saat scroll > 40px
  - Menu: Event, Arsip, Tentang, Kontak, Masuk
  - Client Component
  - Referensi: `COMPONENTS.md` section 2.2
- [ ] **M2-05** Buat `<Footer />`
  - File: `src/components/layout/footer.tsx`
  - 3 kolom: brand, navigasi, sosial
  - Referensi: `COMPONENTS.md` section 2.3
- [ ] **M2-06** Buat layout `(public)`
  - File: `app/(public)/layout.tsx`
  - Bungkus dengan `<Navbar />` + `<Footer />`

**Catatan M2:**
- Setelah M2, buka `/` akan tampil navbar + footer, konten masih blank.

---

## M3 — Landing

Target: landing page dengan hero + carousel event.

- [ ] **M3-01** Buat `lib/fixtures/events.ts`
  - Data mock: **1 event travel** (`lanjalan-vol-1`) saja (tidak ada dummy badminton)
  - Referensi: `CONTENT.md` section 6
- [ ] **M3-02** Buat `lib/api/events.ts` — `getUpcomingEvents`
  - Query Drizzle, tapi fallback ke fixture kalau DB kosong
  - Referensi: `SCHEMA.md` section 5.2
- [ ] **M3-03** Buat `<EventCard />`
  - File: `src/components/event/event-card.tsx`
  - Aspect 16:9, hover scale 1.04
  - Referensi: `COMPONENTS.md` section 3.3
- [ ] **M3-04** Buat `<EventCarousel />`
  - File: `src/components/event/event-carousel.tsx`
  - Horizontal scroll + snap
  - Panah navigasi saat hover (desktop)
  - Referensi: `COMPONENTS.md` section 3.4
- [ ] **M3-05** Buat `<EventStatusBadge />`
  - File: `src/components/event/event-status-badge.tsx`
  - Varian: upcoming, live, past
  - Referensi: `COMPONENTS.md` section 3.5
- [ ] **M3-06** Buat hero landing
  - File: `app/(public)/page.tsx`
  - Background foto + overlay gradient
  - Judul "NGABINTON" + tagline + 2 CTA
  - Referensi: `CONTENT.md` section 3.1
- [ ] **M3-07** Buat section carousel di landing
  - "Event Mendatang" (carousel)
  - "Arsip Lan Jalan" (carousel, filter travel + past)
  - "Momen Kami" (grid galeri — skip kalau belum ada media)

**Catatan M3:**
- Setelah M3, landing page sudah bisa dilihat publik.
- Belum ada link ke halaman event (M4).

---

## M4 — Event Public

Target: halaman `/[slug]` dengan hero, rundown, biaya.

- [ ] **M4-01** Buat `lib/api/events.ts` — `getEventBySlug`
  - Include relasi: rundown, budgets, media, extras
  - Referensi: `SCHEMA.md` section 5.1
- [ ] **M4-02** Buat `app/(public)/[slug]/page.tsx`
  - Fetch event by slug, `notFound()` kalau tidak ada / unpublished
  - Generate metadata (title, description, OG)
- [ ] **M4-03** Buat `<EventHero />` (cinema variant)
  - File: `src/components/event/event-hero.tsx`
  - Referensi: `COMPONENTS.md` section 3.1
- [ ] **M4-04** Buat `<EventMetaBar />`
  - File: `src/components/event/event-meta-bar.tsx`
  - Format: tanggal · waktu · lokasi · biaya
  - Referensi: `COMPONENTS.md` section 3.9
- [ ] **M4-05** Buat `<RundownTimeline />` variant cinema
  - File: `src/components/event/rundown-timeline.tsx`
  - Kolom kiri waktu, dot, kolom kanan aktivitas
  - Referensi: `COMPONENTS.md` section 3.7
- [ ] **M4-06** Buat `<EventSubNav />`
  - File: `src/components/event/event-sub-nav.tsx`
  - Sticky, scroll-spy, anchor list
  - Client Component (IntersectionObserver)
  - Referensi: `COMPONENTS.md` section 3.6
- [ ] **M4-07** Buat section `#rundown` di halaman event
- [ ] **M4-08** Buat section `#biaya` (placeholder)
  - Diisi penuh di M5-05 setelah `<BudgetTable />` siap
- [ ] **M4-09** Buat `app/(public)/arsip/page.tsx`
  - Grid semua event past
  - Referensi: `CONTENT.md` section 3.3

**Catatan M4:**
- Setelah M4, `/lanjalan-vol-1` bisa dibuka (walau baru hero + rundown).
- Section storytelling (M5) akan menambah section di antaranya.

---

## M5 — Storytelling

Target: section-section khusus event travel.

- [ ] **M5-01** Buat `<QuranQuote />`
  - File: `src/components/event/quran-quote.tsx`
  - Font arabic, RTL, terjemahan + source
  - Referensi: `COMPONENTS.md` section 4.1
- [ ] **M5-02** Buat `<StoryNarrative />`
  - File: `src/components/event/story-narrative.tsx`
  - Dua kolom, gambar bisa kiri/kanan
  - Referensi: `COMPONENTS.md` section 4.2
- [ ] **M5-03** Buat `<DestinationCard />`
  - File: `src/components/event/destination-card.tsx`
  - Card full-width, gambar kiri, konten kanan
  - Referensi: `COMPONENTS.md` section 4.3
- [ ] **M5-04** Buat `<TransportCard />`
  - File: `src/components/event/transport-card.tsx`
  - Icon kendaraan + list titik jemput
  - Referensi: `COMPONENTS.md` section 4.4
- [ ] **M5-05** Buat `<BudgetTable />`
  - File: `src/components/event/budget-table.tsx`
  - Tabel + baris total + payment info (opsional)
  - Referensi: `COMPONENTS.md` section 4.5
- [ ] **M5-06** Buat `<GiftExchangeInfo />`
  - File: `src/components/event/gift-exchange-info.tsx`
  - Card orange, icon gift, rules list
  - Referensi: `COMPONENTS.md` section 4.6
- [ ] **M5-07** Buat `<ParticipantGrid />` + `<ClosingMessage />`
  - File: `src/components/event/participant-grid.tsx`
  - File: `src/components/event/closing-message.tsx`
  - Referensi: `COMPONENTS.md` section 4.7 & 4.8
- [ ] **M5-08** Integrasi storytelling section di `/[slug]`
  - Urutan: `#pembuka` → `#narasi` → `#destinasi` → `#transportasi` → `#rundown` → `#makan` → `#biaya` → `#kado` → `#peserta` → `#absen` → `#penutup`
  - Referensi: `DESIGN.md` section 2 (ritme gelap-terang)

**Catatan M5:**
- Setelah M5, halaman `/lanjalan-vol-1` sudah lengkap secara visual.
- Presensi (M6) belum ada, jadi section `#absen` masih placeholder.

---

## M6 — Presensi Peserta

Target: peserta bisa absen via form.

- [ ] **M6-01** Buat `lib/validators/attendance.ts`
  - Zod schema untuk `submitAttendance`
  - Referensi: `RULES.md` section 4.4
- [ ] **M6-02** Buat `actions/attendance.ts` — `submitAttendanceAction`
  - Cek session code, cek duplikat, insert
  - Referensi: `RULES.md` section 3.3 (alur lengkap)
- [ ] **M6-03** Buat `app/(public)/[slug]/absen/page.tsx`
  - Baca query param `code`
  - Kalau sesi tidak aktif → halaman "Presensi ditutup"
  - Kalau aktif → tampilkan form
- [ ] **M6-04** Buat `<AttendanceForm />`
  - File: `src/components/presensi/attendance-form.tsx`
  - Fields: nama, HP, brings_gift (kalau travel)
  - Client Component
  - Referensi: `COMPONENTS.md` section 5.1
- [ ] **M6-05** Buat `<AttendanceSuccess />` + `<AttendanceDuplicate />`
  - File: `src/components/presensi/attendance-success.tsx`
  - File: `src/components/presensi/attendance-duplicate.tsx`
  - Referensi: `COMPONENTS.md` section 5.2 & 5.3
- [ ] **M6-06** Tambah section `#absen` di halaman event
  - CTA "Presensi Sekarang" → `/[slug]/absen?code={activeSessionCode}`
  - Kalau tidak ada sesi aktif → tombol disabled + teks "Presensi akan dibuka saat hari H"

**Catatan M6:**
- Setelah M6, peserta bisa absen **kalau** admin sudah buka sesi.
- Buka sesi (M8) belum ada. Test manual dengan insert sesi di DB.

---

## M7 — Admin Dashboard

Target: admin bisa lihat & kelola event.

- [ ] **M7-01** Buat layout admin
  - File: `app/(admin)/admin/layout.tsx`
  - Sidebar + main content
- [ ] **M7-02** Buat `<AdminSidebar />`
  - File: `src/components/admin/admin-sidebar.tsx`
  - Menu: Dashboard, Event, Pengaturan, Keluar
  - Referensi: `COMPONENTS.md` section 2.5
- [ ] **M7-03** Buat `app/(admin)/admin/page.tsx` (dashboard)
  - Statistik: total event, event aktif, presensi hari ini
  - Quick action: "+ Event Baru"
  - Referensi: `CONTENT.md` section 5.2
- [ ] **M7-04** Buat `<StatCard />`
  - File: `src/components/admin/stat-card.tsx`
  - Referensi: `COMPONENTS.md` section 6.1
- [ ] **M7-05** Buat `app/(admin)/admin/events/page.tsx`
  - Tabel semua event
- [ ] **M7-06** Buat `<EventTable />`
  - File: `src/components/admin/event-table.tsx`
  - Kolom: judul, tipe, tanggal, status, aksi
  - Referensi: `COMPONENTS.md` section 6.4
- [ ] **M7-07** Buat `app/(admin)/admin/events/new/page.tsx`
  - Form buat event baru
- [ ] **M7-08** Buat `<EventForm />`
  - File: `src/components/admin/event-form.tsx`
  - Referensi: `COMPONENTS.md` section 6.2
  - Server Action: `createEventAction`, `updateEventAction`

**Catatan M7:**
- Setelah M7, admin bisa bikin event baru (tanpa rundown/biaya — itu M7 lanjutan).
- Editor rundown & budget: task tambahan di Backlog Baru kalau dibutuhkan.

---

## M8 — Admin QR

Target: admin bisa buka sesi presensi & generate QR.

- [ ] **M8-01** Buat `actions/attendance.ts` — `openAttendanceSessionAction`
  - Tutup sesi lama, generate code, insert
  - Referensi: `SCHEMA.md` section 5.5
- [ ] **M8-02** Buat `actions/attendance.ts` — `closeAttendanceSessionAction`
- [ ] **M8-03** Buat `actions/attendance.ts` — `refreshSessionCodeAction`
- [ ] **M8-04** Buat halaman `app/(admin)/admin/events/[id]/qr/page.tsx`
  - Tampilkan QR + counter + tombol aksi
- [ ] **M8-05** Buat `<QrDisplay />`
  - File: `src/components/presensi/qr-display.tsx`
  - Generate QR pakai library `qrcode` di server
  - Referensi: `COMPONENTS.md` section 5.4
- [ ] **M8-06** Buat Route Handler `/api/qr/[sessionId]`
  - Return PNG download
  - Referensi: `ROUTES.md` section 4.4
- [ ] **M8-07** Buat `<AttendanceCounter />`
  - File: `src/components/presensi/attendance-counter.tsx`
  - Realtime via Supabase Realtime
  - Referensi: `COMPONENTS.md` section 5.7

**Catatan M8:**
- Setelah M8, alur lengkap: admin buka sesi → QR tampil → peserta scan → absen → counter naik realtime.

---

## M9 — Admin Attendance

Target: admin bisa lihat & export daftar hadir.

- [ ] **M9-01** Buat halaman `app/(admin)/admin/events/[id]/attendance/page.tsx`
- [ ] **M9-02** Buat `<AttendanceTable />`
  - File: `src/components/presensi/attendance-table.tsx`
  - Realtime + filter + search
  - Referensi: `COMPONENTS.md` section 5.6
- [ ] **M9-03** Buat `actions/attendance.ts` — `deleteAttendanceAction`
- [ ] **M9-04** Buat Route Handler `/api/attendance/export/[sessionId]`
  - Return CSV
  - Tambah BOM `\uFEFF` di awal
  - Referensi: `ROUTES.md` section 4.3
- [ ] **M9-05** Buat Route Handler `/api/attendance/stream/[sessionId]`
  - SSE stream untuk counter (fallback polling)
  - Referensi: `ROUTES.md` section 4.2
- [ ] **M9-06** Test end-to-end: buka sesi → scan QR dari HP → absen → cek tabel → export CSV

**Catatan M9:**
- Setelah M9, fitur MVP selesai. Yang tersisa: polish & deploy.

---

## M10 — Polish

Target: website terasa "jadi", bukan prototipe.

- [ ] **M10-01** Tambah `loading.tsx` di setiap route utama
  - Pakai `<Skeleton />` sesuai layout
- [ ] **M10-02** Tambah `error.tsx` di `(public)` dan `(admin)`
  - Referensi: `ROUTES.md` section 6
- [ ] **M10-03** Tambah `not-found.tsx` custom
  - Copy dari `CONTENT.md` section 5
- [ ] **M10-04** Empty state untuk semua list
  - Carousel: "Belum ada event. Pantengin terus ya!"
  - Attendance table: "Belum ada yang absen. Jadi yang pertama!"
- [ ] **M10-05** Responsif check
  - Test di 375px, 768px, 1280px
  - Fix layout yang rusak
- [ ] **M10-06** Accessibility audit
  - Focus ring di semua elemen interaktif
  - Alt text di semua gambar
  - Kontras warna dari `DESIGN.md` section 8.1
- [ ] **M10-07** Metadata & SEO
  - `generateMetadata` per halaman
  - OG image default
  - `sitemap.ts` + `robots.ts`
- [ ] **M10-08** Performance
  - Cek bundle size (target < 200KB gzipped)
  - Lazy load komponen berat (lightbox, QR scanner)
- [ ] **M10-09** Update `CHANGELOG.md` dengan semua perubahan

**Catatan M10:**
- Setelah M10, web siap deploy.

---

## M11 — Deploy

Target: production live di Vercel.

- [ ] **M11-01** Push repo ke GitHub
- [ ] **M11-02** Connect repo ke Vercel
- [ ] **M11-03** Set env vars di Vercel dashboard
  - Semua dari `.env.example`
  - Pastikan `NEXT_PUBLIC_APP_URL` = domain production
- [ ] **M11-04** Set region Vercel ke `sin1` (Singapore)
- [ ] **M11-05** Deploy pertama (preview)
  - Cek semua route bisa diakses
- [ ] **M11-06** Setup custom domain (kalau ada)
  - Update `NEXT_PUBLIC_APP_URL`
  - Redeploy
- [ ] **M11-07** Seed production DB
  - Jalankan `scripts/seed.ts` dengan env production
  - Ganti password admin default
- [ ] **M11-08** Smoke test production
  - Login admin
  - Bikin event test
  - Buka sesi QR
  - Scan QR dari HP
  - Cek kehadiran muncul
  - Export CSV
  - Hapus event test

**Catatan M11:**
- Setelah M11, MVP selesai. Lanjut iterasi sesuai kebutuhan.

---

## 3. Backlog Baru

Task yang muncul setelah planning awal, belum dimasukkan ke milestone.

| ID | Task | Prioritas | Ditambahkan |
|---|---|---|---|
| — | (kosong) | — | — |

**Aturan:**
- Task baru **tidak** langsung dikerjakan.
- Tulis di sini dulu, minta konfirmasi manusia.
- Kalau disetujui, pindah ke milestone yang sesuai.

---

## 4. Blocked Tasks

Task yang tidak bisa dilanjutkan karena sesuatu.

| ID | Task | Alasan | Sejak |
|---|---|---|---|
| — | (kosong) | — | — |

---

## 5. Done Log

Catatan task yang sudah selesai, di luar checklist (untuk audit).

| Tanggal | Task | Catatan |
|---|---|---|
| — | — | — |

---

## 6. Pertanyaan Terbuka

Pertanyaan yang butuh jawaban dari manusia sebelum task bisa lanjut.

| # | Pertanyaan | Terkait Task | Status |
|---|---|---|---|✅ 2026-10-10 |
| Q2 | Titik jemput lain selain Vasati Rabbani? | M5-04 | ✅ Samsat Soekarno Hatta, Banjaran, Soreang (`CONTENT.md` §4.6) |
| Q3 | Nomor rekening PIC pembayaran? | M5-05 | 🟡 Placeholder diisi (`CONTENT.md` §4.9) — ganti nilai final sebelum M11 |
| Q4 | Link Google Maps Walini & Pawon? | M5-03, M5-08 | ✅ Walini & Pawon (`CONTENT.md` §4.5 & §4.8) |
| Q5 | Foto hero, destinasi, transport, peserta? | M5-01 s/d M5-07 | ✅ AI-generated (`BRAND.md` §7.4, `CONTENT.md` §10) |
| Q5 | Foto hero, destinasi, transport, peserta? | M5-01 s/d M5-07 | ⏳ Menunggu |

**Aturan:**
- Pertanyaan ditulis di sini, jangan di komentar kode.
- Task yang butuh jawaban → tandai `[!]` di milestone.
- Kalau sudah dijawab, pindah ke Done Log.

---

## 7. Konvensi Update

Setiap selesai task:

1. Ubah `[ ]` → `[x]` di milestone.
2. Tambah baris di section 5 (Done Log) dengan tanggal + ID task.
3. Kalau task memunculkan pertanyaan baru, tulis di section 6.
4. Kalau task memunculkan task baru, tulis di section 3.
5. Update `CHANGELOG.md`.
6. Kalau milestone selesai, ubah status di section 0.

**Contoh update:**
```md
- [x] **M0-01** Init Next.js 15 + TypeScript + pnpm ✅ 2026-11-01
```

---

## 8. Referensi Cepat

| Butuh… | Lihat |
|---|---|
| Cara kerja agent | `AGENTS.md` |
| Keputusan teknis | `ARCHITECTURE.md` |
| Skema DB | `SCHEMA.md` |
| Route | `ROUTES.md` |
| Komponen | `COMPONENTS.md` |
| Aturan bisnis | `RULES.md` |
| Desain visual | `DESIGN.md` |
| Konten | `CONTENT.md` |
| Setup lokal | `SETUP.md` |

---

**Versi:** 1.0
**Terakhir diperbarui:** [tanggal]
**Pemilik:** Tim NGABINTON