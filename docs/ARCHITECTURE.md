# `ARCHITECTURE.md`

# ARCHITECTURE — NGABINTON

> **Sumber kebenaran untuk semua keputusan teknis.**
> File ini menjelaskan *kenapa* sebuah teknologi dipilih, bukan hanya *apa*.
> Agent DILARANG menambah/mengganti library tanpa update file ini + konfirmasi manusia.

---

## 0. Ringkasan Cepat (TL;DR)

```yaml
Framework:        Next.js 15 (App Router)
Language:         TypeScript (strict)
Styling:          Tailwind CSS v4 + CSS variables
UI Primitives:    shadcn/ui
Database:         Postgres (Supabase)
ORM:              Drizzle
Auth:             JWT cookie (jose) + bcryptjs
Validation:       Zod
QR Generate:      qrcode (server)
QR Scan:          html5-qrcode (client)
Realtime:         Supabase Realtime
File Storage:     Supabase Storage
Rate Limit:       Upstash Redis
Image Processing: sharp (server, WebP)
Drag & Drop:      @dnd-kit (admin rundown, M7)
Deploy:           Vercel
Package Manager:  pnpm
```

**Batasan utama:** tidak ada Redux, tRPC, Prisma, NextAuth, styled-components, Material UI.

---

## 1. Architecture Decision Records (ADR)

Setiap keputusan teknis besar dicatat di sini. Format: konteks → keputusan → konsekuensi.

### ADR-001: Next.js 15 App Router (bukan Pages Router)

**Konteks:**
Website ini butuh: SSR untuk halaman event (SEO), ISR untuk landing (cepat & murah), Server Actions untuk form presensi, dan deploy mudah ke Vercel.

**Keputusan:** Pakai App Router.

**Alasan:**
- Server Components → fetch data di server, bundle JS ke client kecil
- Server Actions → form presensi tanpa boilerplate API route
- Native Vercel (dibuat oleh Vercel)
- Layout + nested routing lebih natural untuk halaman `/[slug]` dengan banyak section
- Streaming & Suspense untuk loading state yang mulus

**Konsekuensi:**
- Tim harus paham konsep Server vs Client Component
- Beberapa library (mis. carousel tertentu) yang bergantung `window` harus di-`"use client"`
- Tidak bisa pakai `getServerSideProps` (tapi tidak butuh)

---

### ADR-002: JWT cookie untuk auth (bukan NextAuth)

**Konteks:**
Auth hanya untuk 1–3 admin. Login pakai username + password. Tidak butuh OAuth (Google, GitHub), magic link, atau email verification.

**Keputusan:** Bikin sendiri: `bcryptjs` untuk hash, `jose` untuk sign JWT, cookie httpOnly untuk session, middleware untuk proteksi.

**Alasan:**
- NextAuth overkill untuk credentials-only — setup-nya lebih rumit dari kode yang kita tulis sendiri
- Clerk/Auth0 bayar untuk fitur yang tidak kita pakai
- Kode auth sendiri ±100 baris, mudah di-debug
- Tidak ada dependency besar untuk hal sederhana

**Konsekuensi:**
- Tidak ada fitur: lupa password otomatis, 2FA, session revocation
- Kalau nanti butuh OAuth, migrasi ke NextAuth memakan waktu
- Wajib rate-limit login manual (Upstash Redis)

**Referensi implementasi:** lihat `RULES.md` section Auth.

---

### ADR-003: Drizzle ORM (bukan Prisma)

**Konteks:**
Butuh ORM TypeScript yang jalan di edge runtime, ringan, dan type-safe.

**Keputusan:** Drizzle.

**Alasan:**
- Bundle size jauh lebih kecil dari Prisma (Prisma Client besar, ada engine binary)
- Jalan di edge runtime (Vercel Middleware) tanpa workaround
- SQL-like syntax → mudah optimasi query
- Migrasi cepat, tidak ada "prisma generate" yang berat
- Type inference langsung dari schema, tidak perlu generator

**Konsekuensi:**
- Ekosistem lebih kecil dari Prisma
- Perlu setup manual untuk seeding
- Dokumentasi kadang kurang lengkap untuk edge case

---

### ADR-004: Supabase (bukan Neon + Vercel Blob + lain-lain)

**Konteks:**
Butuh: Postgres, file storage (poster/foto), realtime (counter kehadiran), dan connection pooling untuk Vercel.

**Keputusan:** Pakai Supabase untuk semuanya.

**Alasan:**
- Satu dashboard, satu tagihan (atau satu free tier)
- Postgres + Storage + Realtime + Pooler sudah include
- Free tier cukup: 500MB DB, 1GB storage, 2GB bandwidth
- Client SDK bagus, bisa dipakai dari Next.js
- Auth Supabase tidak dipakai (lihat ADR-002), tapi tetap bisa aktifkan kalau butuh nanti

**Konsekuensi:**
- Vendor lock-in moderat (tapi Postgres bisa migrate ke Neon kapan saja)
- Realtime ada limit concurrent connection di free tier
- Kalau butuh edge caching, harus pakai Vercel di depan

**Alternatif yang ditolak:**
- Neon + Vercel Blob + Pusher: 3 layanan terpisah, ribet
- Railway Postgres: tidak ada storage & realtime

---

### ADR-005: Realtime via Supabase Channels (bukan polling)

**Konteks:**
Di halaman admin QR presensi, counter "X orang sudah hadir" harus update otomatis tanpa refresh.

**Keputusan:** Pakai Supabase Realtime (WebSocket), fallback ke polling 10s kalau koneksi gagal.

**Alasan:**
- Lebih responsif (update instan saat peserta submit)
- Lebih hemat (tidak query tiap 5s)
- Supabase Realtime sudah include

**Konsekuensi:**
- Butuh handle reconnect & cleanup channel
- Kalau peserta >100 concurrent, mungkin kena rate limit — tapi untuk klub kecil aman
- Fallback polling harus tetap ada untuk reliability

---

### ADR-006: QR generation di server, scan di client

**Konteks:**
Admin butuh generate QR code untuk presensi. Peserta scan QR pakai kamera HP.

**Keputusan:**
- Generate: library `qrcode` di Server Action / Route Handler, output PNG
- Scan: library `html5-qrcode` di client component

**Alasan:**
- Generate di server → QR bisa di-cache, bisa diunduh, tidak buka celah XSS
- `html5-qrcode` ringan, akses kamera native, support berbagai format
- Tidak perlu native app

**Konsekuensi:**
- Halaman scan butuh HTTPS (Vercel sudah menyediakan)
- Peserta harus izinkan akses kamera — sediakan fallback input manual

---

### ADR-007: Server Actions untuk mutation (bukan API route)

**Konteks:**
Form presensi, login, buka/tutup sesi presensi, edit event — semua mutasi data.

**Keputusan:** Pakai Server Actions Next.js 15 untuk semua mutasi. API Route Handler hanya untuk: SSE stream, download CSV, download QR PNG.

**Alasan:**
- Server Action = form + validasi + mutation dalam satu file
- Otomatis handle CSRF
- Revalidate cache otomatis via `revalidatePath`
- Lebih sedikit kode dari API route + fetch

**Konsekuensi:**
- Tidak bisa dipanggil dari luar Next.js (mis. mobile app) — tapi tidak butuh
- Debugging sedikit lebih rumit (tidak ada network tab request biasa)

---

### ADR-008: Content stored in DB, not MDX

**Konteks:**
Konten event (rundown, biaya, narasi) perlu diedit admin.

**Keputusan:** Semua konten event disimpan di Postgres, diedit via admin panel.

**Alasan:**
- Admin (pengurus klub) tidak paham markdown / git
- Perlu update cepat tanpa deploy
- Bisa query, filter, sort (mis. "semua event travel tahun ini")

**Konsekuensi:**
- Butuh UI admin yang lebih kaya
- Tidak bisa version-control konten
- Butuh backup DB rutin

**Pengecualian:** teks statis (tagline, deskripsi brand, footer) tetap di `CONTENT.md` / hardcoded.

---

### ADR-009: Rate limit via Upstash Redis + image processing via sharp

**Konteks:**
Butuh rate limit untuk endpoint publik (login, submit presensi) dan konversi gambar ke WebP sebelum upload ke Supabase Storage.

**Keputusan:**
- Rate limit: `@upstash/redis` + `@upstash/ratelimit`.
- Image: `sharp` (server) untuk konversi WebP.

**Alasan:**
- Upstash REST cocok untuk Vercel serverless/edge, tanpa koneksi persisten.
- `sharp` cepat dan native; menghindari upload file besar ke storage.

**Konsekuensi:**
- Butuh akun Upstash + 2 env var (`UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN`).
- Library rate limit punya batas timeout/latency — wajib di-handle agar tidak memblokir request sah.

---

## 2. Struktur Folder

```
ngabinton/
├── .env.example
├── .env.local                  # (gitignored)
├── AGENTS.md
├── ARCHITECTURE.md
├── BRAND.md
├── CHANGELOG.md
├── COMPONENTS.md
├── CONTENT.md
├── DESIGN.md
├── ROUTES.md
├── RULES.md
├── SCHEMA.md
├── SETUP.md
├── TASK.md
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts               # proteksi /admin/*
├── drizzle.config.ts
├── public/
│   ├── events/
│   │   └── lanjalan-vol-1/
│   │       ├── hero-walini.jpg
│   │       ├── cover-travel.jpg
│   │       ├── dest-walini.jpg
│   │       ├── food-pawon.jpg
│   │       ├── menu-pawon.jpg
│   │       ├── transport-angkot.jpg
│   │       └── participants-collage.jpg
│   ├── brand/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   └── favicon.ico
│   └── og/
│       └── default.jpg
├── scripts/
│   ├── seed.ts                 # seed admin + fixture event
│   └── hash-password.ts        # util generate bcrypt hash
└── src/
    ├── app/
    │   ├── layout.tsx          # root layout, font, metadata
    │   ├── globals.css         # tailwind + CSS variables
    │   ├── not-found.tsx
    │   ├── error.tsx
    │   ├── (public)/
    │   │   ├── layout.tsx      # navbar + footer publik
    │   │   ├── page.tsx        # landing
    │   │   ├── arsip/
    │   │   │   └── page.tsx
    │   │   ├── tentang/
    │   │   │   └── page.tsx
    │   │   ├── kontak/
    │   │   │   └── page.tsx
    │   │   └── [slug]/
    │   │       ├── page.tsx    # halaman event
    │   │       └── absen/
    │   │           └── page.tsx # form presensi peserta
    │   ├── (admin)/
    │   │   ├── layout.tsx      # layout admin (sidebar)
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   └── admin/
    │   │       ├── page.tsx    # dashboard
    │   │       ├── events/
    │   │       │   ├── page.tsx
    │   │       │   ├── new/
    │   │       │   │   └── page.tsx
    │   │       │   └── [id]/
    │   │       │       ├── page.tsx
    │   │       │       ├── qr/
    │   │       │       │   └── page.tsx
    │   │       │       └── attendance/
    │   │       │           └── page.tsx
    │   │       └── settings/
    │   │           └── page.tsx
    │   └── api/
    │       ├── auth/
    │       │   └── logout/
    │       │       └── route.ts
    │       ├── attendance/
    │       │   ├── stream/
    │       │   │   └── [sessionId]/
    │       │   │       └── route.ts   # SSE
    │       │   └── export/
    │       │       └── [sessionId]/
    │       │           └── route.ts   # CSV download
    │       └── qr/
    │           └── [sessionId]/
    │               └── route.ts       # PNG download
    ├── actions/                # Server Actions
    │   ├── auth.ts             # login, logout
    │   ├── event.ts            # createEvent, updateEvent, deleteEvent
    │   ├── attendance.ts       # openSession, closeSession, submitAttendance
    │   └── rundown.ts          # reorderRundown, saveRundown
    ├── components/
    │   ├── ui/                 # shadcn primitives (dumb, no data)
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── card.tsx
    │   │   ├── badge.tsx
    │   │   ├── dialog.tsx
    │   │   ├── sheet.tsx
    │   │   ├── toast.tsx
    │   │   ├── skeleton.tsx
    │   │   └── spinner.tsx
    │   ├── layout/
    │   │   ├── navbar.tsx
    │   │   ├── footer.tsx
    │   │   ├── container.tsx
    │   │   └── section-transition.tsx
    │   ├── event/
    │   │   ├── event-hero.tsx
    │   │   ├── travel-hero.tsx
    │   │   ├── event-card.tsx
    │   │   ├── event-carousel.tsx
    │   │   ├── event-status-badge.tsx
    │   │   ├── event-sub-nav.tsx      # anchor scroll-spy
    │   │   ├── quran-quote.tsx
    │   │   ├── story-narrative.tsx
    │   │   ├── destination-card.tsx
    │   │   ├── transport-card.tsx
    │   │   ├── rundown-timeline.tsx
    │   │   ├── budget-table.tsx
    │   │   ├── gift-exchange-info.tsx
    │   │   ├── participant-grid.tsx
    │   │   └── closing-message.tsx
    │   ├── presensi/
    │   │   ├── attendance-form.tsx
    │   │   ├── attendance-success.tsx
    │   │   ├── attendance-duplicate.tsx
    │   │   ├── qr-display.tsx
    │   │   ├── qr-scanner.tsx
    │   │   ├── attendance-table.tsx
    │   │   └── attendance-counter.tsx
    │   └── admin/
    │       ├── admin-sidebar.tsx
    │       ├── event-form.tsx
    │       ├── rundown-editor.tsx
    │       └── stat-card.tsx
    ├── lib/
    │   ├── db/
    │   │   ├── client.ts       # drizzle instance
    │   │   ├── schema.ts       # semua tabel
    │   │   └── queries.ts      # query helpers
    │   ├── api/                # wrapper fetch data internal
    │   │   ├── events.ts
    │   │   ├── attendances.ts
    │   │   └── sessions.ts
    │   ├── auth/
    │   │   ├── jwt.ts          # sign/verify session
    │   │   ├── password.ts     # bcrypt wrapper
    │   │   ├── session.ts      # getSession, setCookie, clearCookie
    │   │   └── rate-limit.ts   # Upstash Redis rate limit
    │   ├── validators/         # zod schemas
    │   │   ├── event.ts
    │   │   ├── attendance.ts
    │   │   └── auth.ts
    │   ├── supabase/
    │   │   ├── client.ts       # browser client (realtime)
    │   │   └── server.ts       # server client (storage upload)
    │   ├── utils/
    │   │   ├── format.ts       # formatDate, formatRupiah
    │   │   ├── slug.ts         # slugify
    │   │   ├── cn.ts           # classname helper
    │   │   └── logger.ts
    │   ├── fixtures/           # mock data untuk dev
    │   │   ├── events.ts
    │   │   ├── rundown.ts
    │   │   └── budget.ts
    │   └── constants.ts        # APP_NAME, SESSION_DURATION, dll
    ├── styles/
    │   └── globals.css         # tailwind + CSS variables dari DESIGN.md
    └── types/
        ├── event.ts
        ├── attendance.ts
        └── index.ts
```

### Aturan Folder

1. **`app/(public)` vs `app/(admin)`** — dua route group dengan layout berbeda. Landing pakai layout publik (navbar transparan + footer), admin pakai sidebar.
2. **`components/ui/`** — primitives shadcn. Dumb. Tidak fetch data. Tidak ada `"use client"` kecuali memang butuh (mis. dialog).
3. **`components/<fitur>/`** — komponen spesifik fitur. Boleh fetch via props, tidak boleh fetch langsung.
4. **`lib/api/`** — satu-satunya tempat yang boleh akses DB untuk baca. Semua query di sini.
5. **`actions/`** — semua Server Actions. Satu file per domain.
6. **`lib/validators/`** — semua Zod schema. Dipakai di actions dan form.
7. **`lib/fixtures/`** — mock data untuk dev tanpa DB.

---

## 3. Rendering Strategy

Setiap halaman punya strategi rendering yang jelas. Agent harus tahu mana yang pakai apa.

| Halaman | Strategy | Alasan |
|---|---|---|
| `/` (landing) | ISR, `revalidate: 60` | Konten jarang berubah, tapi harus cepat |
| `/[slug]` (event) | ISR, `revalidate: 60` + dynamic untuk session status | Poster jarang berubah, tapi status presensi dinamis |
| `/[slug]/absen` | SSR (dynamic) | Butuh cek status sesi realtime |
| `/arsip` | ISR, `revalidate: 300` | Arsip jarang berubah |
| `/tentang` | Static | Konten statis |
| `/login` | Static | Hanya form |
| `/admin/*` | SSR (dynamic) | Data admin harus selalu fresh |

### Aturan Caching

1. **Default: static/ISR.** Baru dynamic kalau butuh.
2. **`revalidatePath`** dipanggil di Server Action setelah mutation.
3. **`unstable_cache`** untuk query yang mahal (mis. `getEventBySlug`).
4. **`revalidateTag`** untuk invalidasi selektif. Tag format: `event:<slug>`, `events:list`.
5. **Jangan cache halaman admin.** Set `export const dynamic = 'force-dynamic'` di layout admin.

---

## 4. Data Flow

### 4.1 Read (Public Page)

```
Server Component (app/(public)/[slug]/page.tsx)
  ↓
lib/api/events.ts → getEventBySlug(slug)
  ↓
lib/db/queries.ts → query Drizzle
  ↓
lib/db/client.ts → Postgres
  ↓
Return data → render Server Component
```

**Aturan:**
- Server Component **boleh** panggil `lib/api/` langsung (bukan fetch)
- Client Component **dilarang** panggil `lib/api/` — pakai props atau Server Action
- Semua data yang masuk Server Component harus tervalidasi (biasanya sudah tervalidasi oleh DB schema)

### 4.2 Write (Form Submission)

```
Client Component (form)
  ↓
<form action={serverAction}>
  ↓
actions/attendance.ts → submitAttendance(formData)
  ↓
1. Zod validate
2. Cek session status
3. Cek duplikat
4. Insert ke DB
  ↓
revalidatePath(`/${slug}/absen`)
  ↓
Return { success: true } atau { error: "..." }
  ↓
Client render feedback (toast / inline)
```

### 4.3 Realtime (Attendance Counter)

```
Admin buka halaman /admin/events/[id]/qr
  ↓
Client Component mount
  ↓
supabase.channel('attendances:' + sessionId)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendances', filter: `session_id=eq.${sessionId}` }, callback)
  .subscribe()
  ↓
Setiap INSERT → update state → render counter
  ↓
On unmount → channel.unsubscribe()
```

**Fallback:** kalau `channel.subscribe()` error atau timeout 5s, fallback ke polling 10s.

### 4.4 Auth Flow

```
POST /login → Server Action loginAction(formData)
  ↓
1. Rate limit cek (Upstash)
2. Query user by username
3. bcrypt.compare(password, hash)
4. Kalau sukses: sign JWT, set cookie httpOnly
5. Redirect /admin
  ↓
Middleware proteksi /admin/*
  ↓
Setiap request: verify JWT dari cookie
  ↓
Kalau valid → lanjut
Kalau invalid → redirect /login
```

---

## 5. Auth Architecture (Detail)

### 5.1 Session Format

JWT payload (minimal, jangan simpan data sensitif):
```ts
{
  sub: string;        // user id
  username: string;
  role: 'admin';
  iat: number;
  exp: number;        // 7 hari
}
```

Cookie:
```
Name:     session
Value:    <jwt>
HttpOnly: true
Secure:   true (production)
SameSite: Lax
Path:     /
Max-Age:  604800 (7 hari)
```

### 5.2 Secret Management

- `AUTH_SECRET` minimal 32 byte, generate dengan `openssl rand -base64 32`
- **Jangan hardcode**. Selalu dari env.
- Rotate kalau ada indikasi leak (semua session jadi invalid, admin harus login ulang).

### 5.3 Proteksi Route

File `middleware.ts`:
```ts
export const config = {
  matcher: ['/admin/:path*'],
};
```

**Pengecualian:** `/login` bukan di bawah `/admin/*`, jadi tidak kena middleware. Kalau login ditaruh di `/admin/login`, harus dikecualikan manual di middleware.

### 5.4 Rate Limiting

- Login: 5 percobaan / 15 menit per IP
- Submit presensi: 5 submit / menit per IP
- Store: Upstash Redis (free tier cukup)
- Key: `ratelimit:login:<ip>`

---

## 6. Database Architecture

### 6.1 Connection

- **Runtime Vercel = serverless** → wajib pakai connection pooler
- **Supabase pooler** (port 6543, mode `transaction`) untuk aplikasi
- **Direct connection** (port 5432) hanya untuk migrasi & seeding

```ts
// lib/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!, {
  max: 1,           // penting untuk serverless
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
```

### 6.2 Migration

- Pakai `drizzle-kit` untuk generate & apply migration
- File migrasi di-commit ke git (`drizzle/` folder)
- Jalankan `pnpm drizzle-kit push` untuk dev, `drizzle-kit migrate` untuk production

### 6.3 Seeding

- Script di `scripts/seed.ts`
- Buat 1 admin user dari env (`SEED_ADMIN_USERNAME`, `SEED_ADMIN_PASSWORD`)
- Buat 1 event fixture `lanjalan-vol-1` dengan rundown & budget

---

## 7. Storage Architecture

- **Supabase Storage** untuk poster & foto event
- Bucket: `public` (bisa dibaca siapa saja), `private` (butuh signed URL)
- Upload via Server Action → `supabase.storage.from('public').upload()`
- URL disimpan di `events.hero_image_url`, dst
- Max file size: 5MB (batasi di form)
- Format: `.webp` (convert di server pakai `sharp`)

---

## 8. Deployment

### 8.1 Vercel

- **Region:** Singapore (`sin1`) — terdekat ke Indonesia
- **Node runtime:** 20.x
- **Env vars:** set via dashboard (production) & `.env.local` (dev)
- **Build command:** `pnpm build`
- **Install command:** `pnpm install --frozen-lockfile`

### 8.2 Domain

- Custom domain: ngabinton.vercel.app
- `NEXT_PUBLIC_APP_URL` harus match domain production

### 8.3 Preview Deployments

- Setiap PR dapat preview URL
- **Jangan share preview URL ke publik** (bisa akses data production kalau DB tidak dipisah)
- **Rekomendasi:** pakai branch DB terpisah untuk preview (Supabase branching)

---

## 9. Environment Variables

Lihat `.env.example` untuk daftar lengkap. Ringkasan:

| Var | Wajib | Deskripsi |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string (pooler) |
| `AUTH_SECRET` | ✅ | JWT signing secret (32+ byte) |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL publik app |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Public key (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Secret key (server only) |
| `UPSTASH_REDIS_URL` | ✅ | Rate limit store |
| `UPSTASH_REDIS_TOKEN` | ✅ | — |
| `SEED_ADMIN_USERNAME` | Dev | Untuk seed |
| `SEED_ADMIN_PASSWORD` | Dev | Untuk seed |

---

## 10. Non-Goals (Yang Tidak Akan Dibuat)

Agent jangan pernah menambahkan fitur ini tanpa instruksi eksplisit:

- ❌ **Multi-tenant** (satu klub, satu instance)
- ❌ **Mobile app native** (cukup web responsif)
- ❌ **Payment gateway** (transfer manual ke rekening PIC)
- ❌ **Email transaksional** (konfirmasi presensi cukup di layar)
- ❌ **Push notification**
- ❌ **Chat / messaging**
- ❌ **Forum / komentar**
- ❌ **Analytics tracking** (minimal pakai Vercel Analytics)
- ❌ **A/B testing**
- ❌ **i18n / multi-bahasa** (hanya Bahasa Indonesia)
- ❌ **Dark/light mode toggle** (varian sudah ditentukan per halaman)
- ❌ **Social login** (username + password saja)
- ❌ **Public registration** (admin dibuat manual via seed)

---

## 11. Constraints & Trade-offs

1. **Harga:** semua harus muat di free tier (Vercel Hobby, Supabase Free, Upstash Free).
2. **Skala:** target <500 member, <50 event/tahun. Bukan enterprise.
3. **Tim:** 1 developer (kamu) + 1 AI agent. Jangan overengineer.
4. **Maintenance:** seminimal mungkin. Jangan pakai library yang sering breaking change.
5. **Reliability:** lebih baik sederhana & jalan daripada canggih tapi rapuh.
6. **Performance:** LCP < 2.5s di 4G Indonesia. Bundle awal < 200KB gzipped.
7. **SEO:** halaman event harus punya meta tag lengkap (OG image, title, description).

---

## 12. Referensi

| Butuh… | Lihat |
|---|---|
| Skema DB | `SCHEMA.md` |
| Route | `ROUTES.md` |
| Komponen | `COMPONENTS.md` |
| Aturan bisnis | `RULES.md` |
| Setup lokal | `SETUP.md` |
| Desain visual | `DESIGN.md` |

---

**Versi:** 1.0
**Terakhir diperbarui:** [tanggal]
**Pemilik:** Tim NGABINTON
