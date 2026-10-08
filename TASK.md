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
Milestone:   M3 — Landing (M0 ✅ · M1 ✅ · M2 ✅)
Progress:    23 / 87 tasks
Terakhir:    M3-01 (2026-10-08)

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

## M0 — Setup ✅ (selesai 2026-10-08)

Target: fondasi project siap, DB connect, seed admin.

- [x] **M0-01** Init Next.js 15 + TypeScript + pnpm ✅ 2026-10-08
  - Dipasang via `create-next-app@15` (bukan `@latest` — versi itu kini memasang Next 16)
  - Hasil: Next **15.5.27** · React **19.1.0** · Tailwind **v4.3.3** · pnpm · App Router + `src/`
  - Boilerplate default dihapus: `page.tsx` (blank), `layout.tsx` (`lang="id"`, metadata brand, Geist dibuang), `globals.css` (bersih, token di M2-02), 5 SVG di `public/` dihapus, `README.md` diganti
  - Tambahan: script `typecheck`; `.gitignore` += `!.env.example`
  - Verifikasi: `pnpm typecheck` ✅ · `pnpm lint` ✅ · `pnpm build` ✅
- [x] **M0-02** Setup Supabase project ✅ 2026-10-08
  - Project Supabase (pooler `aws-0-ap-southeast-2`, free) + kredensial tersimpan di `.env.local`
  - ⚠️ Region terpasang **Sydney (ap-southeast-2)**, bukan Singapore — catatan kecil, tidak blokir
  - ✅ Storage bucket `public` (Public = ON) + Realtime enabled untuk `attendances` & `attendance_sessions` — dijalankan via SQL (2026-10-08)
  - Verifikasi: DB TCP reachable ✅ · Supabase REST terjangkau ✅ · Upstash `PONG` ✅
- [x] **M0-03** Setup `.env.local` + `.env.example` ✅ 2026-10-08
  - `.env.example` sudah lengkap (template)
  - `AUTH_SECRET` di-generate (32 byte → base64, 44 char)
  - `DATABASE_URL` dinormalkan ke pooler transaction **6543** + `sslmode=require`
  - 8 env var wajib terverifikasi terisi (nilai tidak ditampilkan)
- [x] **M0-04** Install dependencies ✅ 2026-10-08
  - Runtime: `drizzle-orm` 0.45.3 · `postgres` 3.4.9 · `jose` 6.2.12 · `bcryptjs` 3.0.3 · `qrcode` 1.5.4 · `html5-qrcode` 2.3.8 · `zod` 4.6.5 · `date-fns` 4.4.0 · `lucide-react` 1.52.0 · `@supabase/supabase-js` 2.117.3 · `@upstash/redis` 1.39.0 · `@upstash/ratelimit` 2.2.0 · `sharp` 0.35.5
  - Dev: `drizzle-kit` 0.31.11 · `@types/qrcode` 1.5.6 · `tsx` 4.23.15
  - ⚠️ **`@types/bcryptjs` dibatalkan** — stub deprecated; bcryptjs 3.x sudah punya tipe sendiri
  - `package.json` += `pnpm.onlyBuiltDependencies` (`esbuild`, `sharp`, `unrs-resolver`) — pnpm 10 memblokir build script secara default
  - `@dnd-kit/*` ditunda ke M7
  - Verifikasi: drizzle-kit/tsx/sharp berfungsi ✅ · `pnpm typecheck` ✅ · `pnpm lint` ✅
- [x] **M0-05** Setup Drizzle config + schema kosong ✅ 2026-10-08
  - `drizzle.config.ts` — dialect `postgresql`, schema `./src/lib/db/schema.ts`, out `./drizzle`; memuat `.env.local` via `process.loadEnvFile` (drizzle-kit tak baca `.env.local` otomatis)
  - `src/lib/db/client.ts` — drizzle + `postgres` (postgres.js), `prepare: false` (wajib untuk transaction pooler 6543), cache koneksi di dev via `globalThis`
  - `src/lib/db/schema.ts` — kosong dulu (tabel diisi M0-06)
  - `package.json` += script `db:generate` / `db:push` / `db:migrate` / `db:studio` / `db:seed`
  - Verifikasi: `pnpm typecheck` ✅ · config memuat `DATABASE_URL` ✅
- [x] **M0-06** Tulis semua tabel di `schema.ts` ✅ 2026-10-08
  - 8 tabel + 4 enum + relations (`SCHEMA.md` §3 & §4); file **252 baris** (< 300)
  - Callback index pakai form **array** `(t) => [...]` (form objek deprecated di drizzle-orm 0.45)
  - Index unik parcial `attendances_session_phone_unique` via `.where(sql\`phone IS NOT NULL\`)`
  - Deviasi kecil: index unik `session_code` & `slug`/`username` dipasang via `.unique()` pada kolom
  - Verifikasi: `pnpm typecheck` ✅
- [x] **M0-07** Generate & apply migration pertama ✅ 2026-10-08
  - `pnpm db:generate` → `drizzle/0000_wise_squadron_supreme.sql` (8 tabel, 4 enum, FK cascade, index + unique parcial)
  - `pnpm exec drizzle-kit push --force` → `[✓] Changes applied` (prompt interaktif di-bypass via `--force`)
  - Verifikasi: 8 tabel ada di Supabase + 4 enum (`user_role`, `event_type`, `event_theme`, `media_type`)
- [x] **M0-08** Seed admin + fixture event ✅ 2026-10-08
  - `scripts/seed.ts` (idempoten) + `scripts/hash-password.ts`
  - Env dimuat via `process.loadEnvFile` sebelum dynamic import `lib/db/client`
  - Hasil: admin 1 · event `lanjalan-vol-1` (travel/storytelling, published+featured) · rundown 6 · budget 7 (6+TOTAL) · extras 5 key (`quran_verse`, `narrative`, `gift_exchange`, `pickup_points`, `payment_info`)
  - Verifikasi: dijalankan 2x → run ke-2 skip (idempoten) ✅; hitung baris DB sesuai ✅

**Catatan M0:**
- Belum ada UI apapun. Fokus fondasi.
- Setelah M0, project bisa jalan (`pnpm dev`) tapi hanya nampilkan halaman blank.

---

## M1 — Auth ✅ (selesai 2026-10-08)

Target: admin bisa login & logout, dashboard protected.

- [x] **M1-01** Buat `lib/auth/jwt.ts` ✅ 2026-10-08
  - `signSession(payload)` → JWT HS256 (exp 7 hari) · `verifySession(token)` → payload \| `null`
  - Edge-compatible (hanya `jose`, tanpa API Node) — aman untuk `middleware.ts`
  - Tipe `SessionPayload` & `SessionRole` di-export dari modul ini
  - Durasi 7 hari inline di modul (bukan `lib/constants.ts` — file itu belum dibuat)
  - Verifikasi: `pnpm typecheck` ✅ · round-trip token valid ✅ · token diubah → `null` ✅ · string acak → `null` ✅
- [x] **M1-02** Buat `lib/auth/password.ts` ✅ 2026-10-08
  - `hashPassword(plain)` / `comparePassword(plain, hash)` via `bcryptjs`, cost **10**
  - Catatan: modul ini Node-only (bukan edge) → jangan dipakai di middleware
  - Verifikasi: `pnpm typecheck` ✅ · hash `$2b$10$` (len 60) ✅ · compare benar=`true`, salah=`false` ✅
- [x] **M1-03** Buat `lib/auth/session.ts` ✅ 2026-10-08
  - `getSession()` → `SessionPayload | null` (baca cookie `session` + verify)
  - `setSessionCookie(token)` / `clearSessionCookie()` — HttpOnly, SameSite=Lax, Path=/, Secure di production, maxAge 7 hari
  - `SESSION_COOKIE_NAME` di-export
  - Verifikasi: `pnpm typecheck` ✅ · `pnpm build` ✅ (uji cookie runtime menyusul di M1-05/M1-07)
- [x] **M1-04** Buat `actions/auth.ts` — `loginAction` ✅ 2026-10-08
  - Tambah `src/lib/validators/auth.ts` (Zod) & `src/lib/api/users.ts` (`getUserByUsername`)
  - Alur: validasi → cari user → `comparePassword` → cek `isActive` → `signSession` → set cookie → update `last_login_at` → `redirect("/admin")`
  - Signature `(prevState, formData)` untuk `useActionState`; sukses = redirect (tidak return `{ ok: true }`) → `RULES.md` §1.1 & `ROUTES.md` §3.1 diselaraskan
  - Pesan error seragam: "Username atau password salah." · akun nonaktif → "Akun dinonaktifkan. Hubungi superadmin."
  - Rate limit BELUM di sini (M1-06)
  - Verifikasi: `pnpm typecheck` ✅ · `pnpm build` ✅ · lookup user + `comparePassword` vs data seed ✅
- [x] **M1-05** Buat halaman `/login` ✅ 2026-10-08
  - File: `app/(admin)/login/page.tsx` (server) + `components/admin/login-form.tsx` (client)
  - Form: username + password + tombol "Masuk" (CONTENT.md §5.1); error via `aria-live`
  - Pakai **`useActionState`** (bukan `useFormState` yang deprecated) + `Button`/`Input`/`Label`
  - Verifikasi: `pnpm typecheck` ✅ · `pnpm build` ✅ · GET `/login` → 200 + berisi "Masuk Admin" & field ✅
  - Catatan: login sukses redirect ke `/admin` yang masih 404 sampai M7 (sesuai catatan TASK.md)
- [x] **M1-06** Setup rate limit login (Upstash Redis) ✅ 2026-10-08
  - `src/lib/auth/rate-limit.ts` — `checkLoginRateLimit(ip)` (slidingWindow 5/5 menit, prefix `ratelimit:login`) + `getClientIp()`
  - Dipasang di `loginAction` (dicek SEBELUM validasi kredensial)
  - **Fail closed**: kalau Upstash tak bisa diakses → login ditolak ("Layanan sedang sibuk...") sesuai prinsip `RULES.md` §0 — bisa diubah kalau Anda mau fail-open
  - Verifikasi: `pnpm typecheck` ✅ · `pnpm build` ✅ · uji 6 percobaan → #1–#5 lolos, #6 diblokir ✅
- [x] **M1-07** Buat `middleware.ts` ✅ 2026-10-08
  - ⚠️ Ditaruh di **`src/middleware.ts`** (bukan root) — project memakai `src-dir`, kalau di root middleware tidak dijalankan (sempat 404). `ROUTES.md`/`ARCHITECTURE.md` diperbarui
  - Matcher `/admin/:path*`; verify JWT (edge-safe); invalid → redirect `/login?redirect={path}` + hapus cookie basi
  - Sekalian aktifkan param `redirect` end-to-end: `constants.ts` (SESSION_COOKIE_NAME), page baca `searchParams`, form kirim hidden field, action validasi path internal (`safeRedirectPath`)
  - Verifikasi: `pnpm build` ✅ (`ƒ Middleware 39.3 kB`) · `/admin` & `/admin/events` → **307** ke `/login?redirect=...` ✅ · `/login` → 200 ✅
  - ⚠️ Build memunculkan warning edge soal `CompressionStream` dari `jose` (path JWE yang tidak kita pakai) — tidak mengganggu
- [x] **M1-08** Buat `actions/auth.ts` — `logoutAction` ✅ 2026-10-08
  - Clear cookie session → redirect `/login`
  - Verifikasi: `pnpm typecheck` ✅ · `pnpm build` ✅ (uji klik menyusul di M7 saat tombol Keluar dibuat)

**Catatan M1:**
- Setelah M1, akses `/admin` (belum ada halaman) akan redirect ke `/login`.
- Login sukses → redirect ke `/admin` (yang akan 404 dulu, itu OK).

---

## M2 — Layout ✅ (selesai 2026-10-08)

Target: kerangka visual (navbar, footer, container) siap dipakai.

- [x] **M2-01** Setup font di `app/layout.tsx` ✅ 2026-10-08 *(ditarik ke depan untuk M1-05)*
  - Anton (display), Inter (body), Caveat (script), Noto Naskh Arabic, JetBrains Mono via `next/font/google`
  - Variabel `--font-*` dipasang di `<html>` dan dipetakan di `globals.css` (`@theme`)
- [x] **M2-02** Setup token warna di `globals.css` ✅ 2026-10-08 *(ditarik ke depan untuk M1-05)*
  - Semua token DESIGN.md §3–§6 (cinema + storytelling, aksen, radius, shadow, motion) via Tailwind v4 `@theme`
  - Base `body` + blok `prefers-reduced-motion`
- [x] **M2-03** Buat `<Container />` ✅ 2026-10-08 *(ditarik ke depan untuk M1-05)*
  - File: `src/components/layout/container.tsx` — props `size` (sm/md/lg/xl/full), `as`, `className`
- [x] **M2-04** Buat `<Navbar />` ✅ 2026-10-08
  - File: `src/components/layout/navbar.tsx` (client) — transparan → solid setelah scroll ≥ 40px (`background-elevated` + `shadow-card`)
  - Menu: Event, Arsip, Tentang, Kontak, Masuk (`ROUTES.md` §9.1); mobile: hamburger → `<Sheet side="top">` + ikon Masuk
  - Logo = wordmark teks (Anton 24px, `font-display`) — belum perlu aset SVG (`public/brand/logo.svg` belum ada)
  - Tambahan: primitif **`src/components/ui/sheet.tsx`** (drawer sederhana tanpa Radix) sesuai `COMPONENTS.md` §7.1
  - Verifikasi: `pnpm typecheck` ✅ · `pnpm build` ✅ (uji visual menyusul di M2-06 saat dipakai layout publik)
- [x] **M2-05** Buat `<Footer />` ✅ 2026-10-08
  - File: `src/components/layout/footer.tsx` (Server) — 3 kolom: brand, navigasi, sosial + baris bawah
  - Teks dari `CONTENT.md` §2.2; tautan sosial masih placeholder (`CONTENT.md` §8)
  - ⚠️ Lucide v1 **tidak punya icon brand** (Instagram dll) → pakai icon generik (`Camera`, `MessageCircle`, `Mail`)
  - Verifikasi: `pnpm typecheck` ✅ · `pnpm build` ✅
- [x] **M2-06** Buat layout `(public)` ✅ 2026-10-08
  - File: `src/app/(public)/layout.tsx` — bungkus `<Navbar />` + `<Footer />`
  - Landing `src/app/page.tsx` dipindah ke `src/app/(public)/page.tsx` (kalau tidak, route `/` bentrok)
  - Verifikasi: `pnpm build` ✅ · GET `/` → navbar+footer ada ✅ · GET `/login` → tidak ada footer publik ✅

**Catatan M2:**
- Setelah M2, buka `/` akan tampil navbar + footer, konten masih blank.

---

## M3 — Landing

Target: landing page dengan hero + carousel event.

- [x] **M3-01** Buat `lib/fixtures/events.ts` ✅ 2026-10-08
  - `src/lib/fixtures/events.ts` — 1 event travel `lanjalan-vol-1` (`eventFixtures`) dari `CONTENT.md` §6
  - Tambahan: `src/lib/types/event.ts` (tipe domain dari schema Drizzle: `Event`, `RundownItem`, `BudgetItem`, `EventMedia`, `EventExtra`)
  - `startsAt`/`endsAt` pakai `Date` (tipe schema), `id`/timestamp sintetis untuk mock
  - `ARCHITECTURE.md` tree: `src/types/` → `src/lib/types/` (selaras `AGENTS.md` §3.2)
  - Verifikasi: `pnpm typecheck` ✅ · `pnpm build` ✅
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
  - Data via **SSE** `/api/attendance/stream/[sessionId]` + fallback polling (bukan Supabase Realtime — `ARCHITECTURE.md` ADR-010)
  - Referensi: `COMPONENTS.md` section 5.7

**Catatan M8:**
- Setelah M8, alur lengkap: admin buka sesi → QR tampil → peserta scan → absen → counter naik realtime.

---

## M9 — Admin Attendance

Target: admin bisa lihat & export daftar hadir.

- [ ] **M9-01** Buat halaman `app/(admin)/admin/events/[id]/attendance/page.tsx`
- [ ] **M9-02** Buat `<AttendanceTable />`
  - File: `src/components/presensi/attendance-table.tsx`
  - SSE + filter + search (bukan Supabase Realtime)
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
| B1 | `POST /api/auth/logout` (route handler, `ROUTES.md` §4.1) — apakah perlu, atau cukup `logoutAction` saja? Kalau tak perlu, hapus dari `ROUTES.md` | Rendah | 2026-10-08 |

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
| 2026-10-08 | M0-01 | Next.js 15.5.27 + TypeScript + Tailwind v4 + pnpm; boilerplate dibersihkan; typecheck/lint/build lolos |

| 2026-10-08 | M0-02 | Supabase project + kredensial di `.env.local`; verifikasi konektivitas DB/REST/Upstash lolos |
| 2026-10-08 | M0-03 | `.env.local` lengkap; `AUTH_SECRET` di-generate; `DATABASE_URL` → pooler 6543 + `sslmode=require` |
---
| 2026-10-08 | M0-07 | Migration `0000_wise_squadron_supreme.sql` di-generate & di-push; 8 tabel + 4 enum terverifikasi di Supabase |
| 2026-10-08 | M0-08 | Seed idempoten: admin + event fixture + rundown/budget/extras; verifikasi baris DB sesuai |
| 2026-10-08 | M1-01 | `lib/auth/jwt.ts` (signSession/verifySession, HS256, 7 hari); round-trip & tamper test lolos |
| 2026-10-08 | M1-02 | `lib/auth/password.ts` (bcryptjs cost 10); hash/compare test lolos |
| 2026-10-08 | M1-03 | `lib/auth/session.ts` (getSession/setSessionCookie/clearSessionCookie); typecheck+build lolos |
| 2026-10-08 | M1-04 | `actions/auth.ts` loginAction + validators/auth + api/users; signature diselaraskan; typecheck/build & uji DB lolos |
| 2026-10-08 | M1-05 | Halaman `/login` + `LoginForm` + `Button`/`Input`/`Label`; GET /login → 200 |
| 2026-10-08 | M2-01 | Font Anton/Inter/Caveat/Noto Naskh Arabic/JetBrains Mono di `layout.tsx` (ditarik ke depan) |
| 2026-10-08 | M2-02 | Token desain di `globals.css` via Tailwind v4 `@theme` (ditarik ke depan) |
| 2026-10-08 | M2-03 | `<Container />` (ditarik ke depan) |
| 2026-10-08 | M1-06 | `lib/auth/rate-limit.ts` (Upstash, 5/5 menit/IP) + integrasi loginAction; uji 6x lolos |
| 2026-10-08 | M1-07 | `src/middleware.ts` proteksi /admin/*; param `redirect` diaktifkan end-to-end; 307 terverifikasi |
| 2026-10-08 | M1-08 | `logoutAction` (clear cookie + redirect /login); milestone M1 ✅ selesai |
| 2026-10-08 | M2-04 | `<Navbar />` + primitif `<Sheet />`; typecheck/build lolos |
| 2026-10-08 | M2-05 | `<Footer />` (3 kolom + baris bawah); typecheck/build lolos |
| 2026-10-08 | M2-06 | Layout `(public)` + landing dipindah ke route group; milestone M2 ✅ selesai |
| 2026-10-08 | M3-01 | `lib/types/event.ts` + `lib/fixtures/events.ts` (1 travel fixture) |
| 2026-10-08 | M0-06 | 8 tabel + 4 enum + relations ditulis di `schema.ts` (252 baris); typecheck lolos |
| 2026-10-08 | M0-04 | 13 dependency runtime + 3 dev terpasang; `pnpm.onlyBuiltDependencies` diset; @types/bcryptjs dihapus |
| 2026-10-08 | M0-05 | `drizzle.config.ts` + `lib/db/client.ts` (prepare:false) + `schema.ts` kosong; script `db:*` ditambah |

## 6. Pertanyaan Terbuka

Pertanyaan yang butuh jawaban dari manusia sebelum task bisa lanjut.

| # | Pertanyaan | Terkait Task | Status |
|---|---|---|---|✅ 2026-10-10 |
| Q2 | Titik jemput lain selain Vasati Rabbani? | M5-04 | ✅ Samsat Soekarno Hatta, Banjaran, Soreang (`CONTENT.md` §4.6) |
| Q3 | Nomor rekening PIC pembayaran? | M5-05 | 🟡 Placeholder diisi (`CONTENT.md` §4.9) — ganti nilai final sebelum M11 |
| Q4 | Link Google Maps Walini & Pawon? | M5-03, M5-08 | ✅ Walini & Pawon (`CONTENT.md` §4.5 & §4.8) |
| Q5 | Foto hero, destinasi, transport, peserta? | M5-01 s/d M5-07 | ✅ AI-generated (`BRAND.md` §7.4, `CONTENT.md` §10) |
| Q6 | ~~Realtime `attendances` aktif tanpa RLS~~ | M8-07 | ✅ Diputuskan: **server SSE + polling fallback**, tanpa Supabase Realtime (`ARCHITECTURE.md` ADR-010). Publication Realtime dilepas + RLS diaktifkan |
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