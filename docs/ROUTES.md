# `ROUTES.md`

# ROUTES — NGABINTON

> **Sumber kebenaran untuk semua URL, Server Actions, dan Route Handlers.**
> Setiap route baru wajib dicatat di sini sebelum diimplementasi.
> Agent DILARANG membuat route di luar daftar ini tanpa update file ini.

---

## 0. Ringkasan Cepat (TL;DR)

```yaml
Route Groups:
  (public)  → halaman publik dengan navbar transparan + footer
  (admin)   → halaman admin dengan sidebar + protected

Public pages:     8
Admin pages:      6
Server Actions:   12
Route Handlers:   4
Auth protected:   /admin/* (via middleware)
Dynamic routes:   /[slug], /[slug]/absen, /admin/events/[id]/*

Slug event aktif: lanjalan-vol-1
```

---

## 1. Peta Route

### 1.1 Public Routes

Semua route di bawah ini **bisa diakses tanpa login**. Layout: `app/(public)/layout.tsx`.

| URL | File | Render | Deskripsi |
|---|---|---|---|
| `/` | `app/(public)/page.tsx` | ISR (60s) | Landing page: hero + carousel event |
| `/arsip` | `app/(public)/arsip/page.tsx` | ISR (300s) | Grid semua event yang sudah lewat |
| `/tentang` | `app/(public)/tentang/page.tsx` | Static | Cerita komunitas, struktur pengurus |
| `/kontak` | `app/(public)/kontak/page.tsx` | Static | Sosmed & kontak admin |
| `/[slug]` | `app/(public)/[slug]/page.tsx` | ISR (60s) | Halaman event (badminton / travel) |
| `/[slug]/absen` | `app/(public)/[slug]/absen/page.tsx` | SSR (dynamic) | Form presensi peserta |
| `/e/[slug]/absen` | `app/(public)/e/[slug]/absen/page.tsx` | SSR (dynamic) | Alias pendek untuk QR code (redirect ke `/[slug]/absen` setelah validasi) |
| `/login` | `app/(admin)/login/page.tsx` | Static | Form login admin |

**Catatan:**
- `/[slug]` hanya untuk event dengan `is_published = true`. Kalau tidak, return 404.
- `/e/[slug]/absen?code=XXXXXX` — dipakai QR. Kalau `code` tidak valid atau sesi tutup, tampilkan halaman error khusus (bukan 404).
- `/login` secara teknis di route group `(admin)` supaya tidak ada navbar publik, tapi **tidak** di-protect middleware (karena ini pintu masuk).

---

### 1.2 Admin Routes (Protected)

Semua route di bawah ini **butuh login**. Layout: `app/(admin)/admin/layout.tsx`.

| URL | File | Deskripsi |
|---|---|---|
| `/admin` | `app/(admin)/admin/page.tsx` | Dashboard: statistik + aksi cepat |
| `/admin/events` | `app/(admin)/admin/events/page.tsx` | Daftar semua event (draft + publish) |
| `/admin/events/new` | `app/(admin)/admin/events/new/page.tsx` | Form buat event baru |
| `/admin/events/[id]` | `app/(admin)/admin/events/[id]/page.tsx` | Detail event + edit |
| `/admin/events/[id]/rundown` | `app/(admin)/admin/events/[id]/rundown/page.tsx` | Editor rundown (drag & drop) |
| `/admin/events/[id]/budget` | `app/(admin)/admin/events/[id]/budget/page.tsx` | Editor biaya |
| `/admin/events/[id]/qr` | `app/(admin)/admin/events/[id]/qr/page.tsx` | Panel QR + statistik kehadiran live |
| `/admin/events/[id]/attendance` | `app/(admin)/admin/events/[id]/attendance/page.tsx` | Tabel kehadiran + export CSV |
| `/admin/settings` | `app/(admin)/admin/settings/page.tsx` | Akun admin, ganti password |

**Proteksi:** semua di atas di-match oleh `middleware.ts` dengan matcher `/admin/:path*`.

---

### 1.3 Route Handlers (API)

Hanya dipakai untuk kebutuhan yang **tidak bisa** dilakukan Server Action: streaming, download file, webhook.

| URL | File | Method | Deskripsi |
|---|---|---|---|
| `/api/auth/logout` | `app/api/auth/logout/route.ts` | POST | Clear cookie, redirect ke `/login` |
| `/api/attendance/stream/[sessionId]` | `app/api/attendance/stream/[sessionId]/route.ts` | GET | Server-Sent Events: counter kehadiran realtime |
| `/api/attendance/export/[sessionId]` | `app/api/attendance/export/[sessionId]/route.ts` | GET | Download CSV daftar hadir |
| `/api/qr/[sessionId]` | `app/api/qr/[sessionId]/route.ts` | GET | Download QR sebagai PNG |

**Auth:**
- `/api/auth/logout` — tidak perlu auth (kalau tidak ada cookie, tetap redirect)
- `/api/attendance/*` — **wajib admin** (cek session di handler)
- `/api/qr/*` — **wajib admin**

**Aturan:**
- Route Handler **bukan** pengganti Server Action. Kalau bisa pakai Server Action, pakai Server Action.
- Semua Route Handler yang mengembalikan file harus set header `Content-Disposition`.

---

### 1.4 Special Routes

| URL | File | Deskripsi |
|---|---|---|
| `/not-found` | `app/not-found.tsx` | 404 custom |
| `/error` | `app/error.tsx` | Error boundary |
| `/sitemap.xml` | `app/sitemap.ts` | Sitemap dinamis |
| `/robots.txt` | `app/robots.ts` | Robots dinamis |
| `/opengraph-image` | `app/opengraph-image.tsx` | OG image default |

---

## 2. Detail Halaman Event `/[slug]`

Halaman event punya banyak section dengan anchor untuk navigasi cepat. Sub-navbar sticky akan scroll-spy ke anchor ini.

### 2.1 Anchor List

| Anchor | Section | Muncul di varian |
|---|---|---|
| `#hero` | Hero (top) | Semua |
| `#pembuka` | Ayat & narasi | Storytelling |
| `#destinasi` | Destinasi | Storytelling |
| `#transportasi` | Transportasi | Storytelling |
| `#rundown` | Rundown | Semua |
| `#makan` | Makan siang | Storytelling |
| `#biaya` | Biaya | Semua |
| `#kado` | Tukar kado | Storytelling (kalau ada) |
| `#peserta` | Peserta | Semua |
| `#absen` | Presensi | Semua |
| `#penutup` | Closing | Semua |

### 2.2 Sub-navbar Behavior

- Sticky di bawah navbar utama setelah scroll > hero height.
- Isi: daftar anchor (horizontal scroll di mobile).
- Active state: anchor yang sedang di-viewport → underline `primary` (cinema) / `story-teal` (storytelling).
- Klik anchor → smooth scroll (dengan `scroll-behavior: smooth` + offset navbar).
- Hilang saat masuk section presensi (karena presensi punya CTA sendiri).

### 2.3 Query Params

| Param | Dipakai di | Deskripsi |
|---|---|---|
| `code` | `/[slug]/absen?code=XXXXXX` | Session code dari QR |
| `redirect` | `/login?redirect=/admin/events` | Redirect setelah login sukses |
| `filter` | `/admin/events/[id]/attendance?filter=gift` | Filter tabel kehadiran |

**Aturan:** semua query param divalidasi dengan Zod. Kalau invalid, ignore (bukan error).

---

## 3. Server Actions

Semua Server Action ditaruh di `src/actions/`. Satu file per domain.

### 3.1 Auth — `actions/auth.ts`

| Action | Input | Output | Efek |
|---|---|---|---|
| `loginAction` | `FormData { username, password }` | `{ ok: true } \| { error: string }` | Set cookie session, redirect `/admin` |
| `logoutAction` | — | — | Clear cookie, redirect `/login` |
| `changePasswordAction` | `FormData { oldPassword, newPassword }` | `{ ok: true } \| { error }` | Update hash di DB |

**Aturan:**
- `loginAction` wajib rate limit (5 percobaan / 15 menit / IP).
- Error message seragam: "Username atau password salah." (jangan bedakan user not found vs password wrong).
- `changePasswordAction` wajib re-login setelah sukses.

### 3.2 Event — `actions/event.ts`

| Action | Input | Output | Efek |
|---|---|---|---|
| `createEventAction` | `FormData` (schema dari `validators/event.ts`) | `{ ok: true, id } \| { error }` | Insert event, redirect ke `/admin/events/[id]` |
| `updateEventAction` | `FormData { id, ...fields }` | `{ ok: true } \| { error }` | Update event, revalidate path |
| `deleteEventAction` | `{ id }` | `{ ok: true } \| { error }` | Hapus event (cascade), redirect `/admin/events` |
| `publishEventAction` | `{ id }` | `{ ok: true }` | Set `is_published = true`, revalidate `/[slug]` |
| `unpublishEventAction` | `{ id }` | `{ ok: true }` | Set `is_published = false`, revalidate |
| `toggleFeaturedAction` | `{ id }` | `{ ok: true }` | Set `is_featured`, pastikan hanya 1 featured |

**Aturan:**
- `createEventAction` dan `updateEventAction` wajib validasi Zod.
- `deleteEventAction` harus konfirmasi via dialog dulu di UI.
- Slug di-generate dari title kalau kosong. Cek uniqueness sebelum insert.

### 3.3 Rundown — `actions/rundown.ts`

| Action | Input | Output | Efek |
|---|---|---|---|
| `saveRundownAction` | `{ eventId, items: [{ id?, order, time, title, note, isOptional }] }` | `{ ok: true } \| { error }` | Upsert semua item, hapus yang tidak ada di list |
| `reorderRundownAction` | `{ eventId, itemIds: string[] }` | `{ ok: true }` | Update `order` sesuai urutan array |

**Aturan:**
- `saveRundownAction` idempotent — bisa dipanggil berkali-kali dengan data sama.
- Reorder harus dalam transaction (kalau gagal di tengah, rollback).

### 3.4 Budget — `actions/budget.ts`

| Action | Input | Output | Efek |
|---|---|---|---|
| `saveBudgetAction` | `{ eventId, items: [...] }` | `{ ok: true } \| { error }` | Sama seperti rundown |

### 3.5 Presensi — `actions/attendance.ts`

| Action | Input | Output | Efek |
|---|---|---|---|
| `openAttendanceSessionAction` | `{ eventId, durationMinutes? }` | `{ ok: true, sessionCode } \| { error }` | Tutup sesi lama, buat sesi baru, revalidate |
| `closeAttendanceSessionAction` | `{ sessionId }` | `{ ok: true }` | Set `is_active = false`, `closed_at = now()` |
| `refreshSessionCodeAction` | `{ sessionId }` | `{ ok: true, newCode } \| { error }` | Generate code baru (QR lama tidak valid) |
| `submitAttendanceAction` | `FormData { code, name, phone?, bringsGift? }` | `{ ok: true } \| { error: 'duplicate' \| 'session_closed' \| 'invalid_code' \| 'unknown', data? }` | Insert kehadiran |
| `deleteAttendanceAction` | `{ attendanceId }` | `{ ok: true }` | Hapus satu baris kehadiran (admin) |

**Aturan `submitAttendanceAction`:**
1. Rate limit: 5 submit / menit / IP.
2. Cari sesi dari `code`. Kalau tidak ada → `invalid_code`.
3. Cek `is_active`. Kalau false → `session_closed`.
4. Cek duplikat (phone atau name + ip_hash). Kalau ada → `duplicate` + return data existing.
5. Insert kehadiran.
6. Revalidate `/[slug]/absen`.
7. Return `{ ok: true, name, checkedInAt }`.

**Aturan `openAttendanceSessionAction`:**
- Tutup semua sesi aktif lain di event yang sama.
- Generate `session_code` unik (6 char, tanpa karakter ambigu).
- Return `session_code` untuk ditampilkan di QR.
- Revalidate `/admin/events/[id]/qr`.

### 3.6 Media — `actions/media.ts`

| Action | Input | Output | Efek |
|---|---|---|---|
| `uploadEventMediaAction` | `FormData { eventId, type, file }` | `{ ok: true, url } \| { error }` | Upload ke Supabase Storage, insert ke `event_media` |
| `deleteEventMediaAction` | `{ mediaId }` | `{ ok: true }` | Hapus dari storage + DB |

**Aturan:**
- Max file size 5MB.
- Format: JPG, PNG, WebP.
- Convert ke WebP sebelum upload (pakai `sharp` di server).

### 3.7 Extras — `actions/extras.ts`

| Action | Input | Output | Efek |
|---|---|---|---|
| `saveExtraAction` | `{ eventId, key, value }` | `{ ok: true }` | Upsert `event_extras` |
| `deleteExtraAction` | `{ eventId, key }` | `{ ok: true }` | Hapus satu key |

**Keys yang dipakai:** lihat `SCHEMA.md` section 3.6.

---

## 4. Route Handlers (API)

### 4.1 `POST /api/auth/logout`

**File:** `app/api/auth/logout/route.ts`

**Input:** tidak ada body. Cookie session dihapus.

**Output:** redirect 302 ke `/login`.

**Auth:** tidak perlu (idempotent).

**Catatan:** sebenarnya ini bisa jadi Server Action, tapi Route Handler dipakai karena butuh clear cookie + redirect dalam satu round-trip.

---

### 4.2 `GET /api/attendance/stream/[sessionId]`

**File:** `app/api/attendance/stream/[sessionId]/route.ts`

**Auth:** wajib admin (cek `getSession()` di handler).

**Response:** `text/event-stream`

**Format event:**
```
event: count
data: {"count": 42, "lastCheckIn": "Bagas", "at": "2026-11-15T07:12:33Z"}

event: heartbeat
data: {"at": "..."}
```

**Heartbeat:** setiap 30 detik, supaya koneksi tidak ditutup oleh proxy.

**Close:** client disconnect via `AbortController`.

**Fallback:** kalau SSE gagal, admin page fallback ke polling `/api/attendance/stream/[sessionId]?mode=polling` (return JSON sekali).

---

### 4.3 `GET /api/attendance/export/[sessionId]`

**File:** `app/api/attendance/export/[sessionId]/route.ts`

**Auth:** wajib admin.

**Response:** CSV file.

**Header:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="attendance-{slug}-{sessionCode}.csv"
```

**Kolom CSV:**
```
No, Nama, No. HP, Email, Instansi, Bawa Kado, Waktu Hadir
```

**Format waktu:** `YYYY-MM-DD HH:mm:ss` (WIB).

**BOM:** tambahkan `\uFEFF` di awal file supaya Excel bisa baca UTF-8.

---

### 4.4 `GET /api/qr/[sessionId]`

**File:** `app/api/qr/[sessionId]/route.ts`

**Auth:** wajib admin.

**Query params:**
- `size` (opsional, default 512, max 1024)
- `format` (opsional, `png` | `svg`, default `png`)

**Response:** file PNG / SVG.

**Header:**
```
Content-Type: image/png (atau image/svg+xml)
Content-Disposition: attachment; filename="qr-{slug}-{sessionCode}.png"
Cache-Control: no-store
```

**Isi QR:** URL lengkap `{NEXT_PUBLIC_APP_URL}/e/{slug}/absen?code={sessionCode}`.

---

## 5. Redirects

Redirect dikelola di `next.config.ts` (untuk redirect statis) atau di Server Action / middleware (untuk redirect dinamis).

### 5.1 Redirect Statis

| From | To | Type |
|---|---|---|
| `/home` | `/` | 301 |
| `/events` | `/arsip` | 301 |
| `/admin/login` | `/login` | 301 |

### 5.2 Redirect Dinamis

| Kondisi | Aksi |
|---|---|
| Akses `/admin/*` tanpa session | Redirect ke `/login?redirect={path}` |
| Login sukses dengan `redirect` param | Redirect ke `redirect` (validasi path internal) |
| Akses `/[slug]` event `is_published = false` | `notFound()` |
| Akses `/[slug]/absen` sesi tidak aktif | Tampilkan halaman "Presensi ditutup" (bukan redirect) |

**Aturan validasi `redirect` param:**
- Hanya boleh path internal (mulai dengan `/`).
- Tidak boleh `//` atau `http` (mencegah open redirect).
- Fallback ke `/admin` kalau invalid.

---

## 6. Error Pages

| File | Muncul kapan | Isi |
|---|---|---|
| `app/not-found.tsx` | 404 (event tidak ada, route tidak ada) | "Halaman tidak ditemukan" + link ke beranda |
| `app/error.tsx` | Runtime error di Server Component | "Ada yang salah" + tombol "Coba lagi" |
| `app/(public)/[slug]/absen/not-found.tsx` | Session code invalid | "Kode presensi tidak valid" + form input manual |
| `app/(admin)/admin/error.tsx` | Error di dashboard admin | "Error" + tombol "Kembali ke Dashboard" |

**Aturan:**
- Error page publik harus tetap pakai navbar & footer.
- Error page admin pakai sidebar (biar admin bisa navigasi).
- Jangan bocorkan stack trace atau detail error ke user (log di server saja).

---

## 7. Middleware

**File:** `middleware.ts` (root)

**Matcher:**
```ts
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
```

**Logika:**
```ts
1. Ambil cookie session.
2. Kalau tidak ada → redirect /login?redirect={path}
3. Verify JWT.
4. Kalau invalid/expired → clear cookie, redirect /login
5. Kalau valid → next()
```

**Yang tidak di-match:**
- `/login` — pintu masuk, tidak perlu protect
- `/api/*` — Route Handler punya proteksi sendiri
- `/(public)/*` — semua publik

**Catatan:** middleware jalan di Edge Runtime. Jangan import Drizzle atau bcrypt di sini. Hanya `jose` (edge-compatible).

---

## 8. Sitemap & SEO

### 8.1 Sitemap (`app/sitemap.ts`)

Include:
- `/` (priority 1.0)
- `/arsip` (priority 0.8)
- `/tentang` (priority 0.6)
- `/kontak` (priority 0.6)
- Setiap `/[slug]` event yang `is_published = true` (priority 0.9)

**Exclude:**
- `/login`
- `/admin/*`
- `/api/*`

### 8.2 Robots (`app/robots.ts`)

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /login
Sitemap: {NEXT_PUBLIC_APP_URL}/sitemap.xml
```

### 8.3 OpenGraph

Setiap halaman event punya OG image dari `event.cover_image_url`. Kalau tidak ada, fallback ke `/og/default.jpg`.

Metadata di-generate via `generateMetadata()` di `app/(public)/[slug]/page.tsx`.

---

## 9. Navigasi UI

### 9.1 Navbar Public (Top)

| Label | Route | Catatan |
|---|---|---|
| Logo NGABINTON | `/` | — |
| Event | `/#events` | Smooth scroll |
| Arsip | `/arsip` | — |
| Tentang | `/tentang` | — |
| Kontak | `/kontak` | — |
| Masuk | `/login` | Icon-only di mobile |

### 9.2 Sub-navbar Event (Sticky)

Lihat section 2.2. Anchor list dari section 2.1.

### 9.3 Sidebar Admin

| Label | Route | Icon |
|---|---|---|
| Dashboard | `/admin` | `LayoutDashboard` |
| Event | `/admin/events` | `CalendarDays` |
| Pengaturan | `/admin/settings` | `Settings` |
| Keluar | (action) | `LogOut` |

### 9.4 Footer

| Kolom | Isi |
|---|---|
| Brand | Logo + tagline |
| Navigasi | Event, Arsip, Tentang |
| Sosial | Instagram, WhatsApp, Email |
| Legal | © 2026 NGABINTON |

---

## 10. Aturan Route

1. **Setiap route baru wajib didaftarkan di file ini.**
2. **Route publik harus SEO-friendly** — pakai metadata + OG image.
3. **Route admin tidak boleh di-index** — set `robots: { index: false }` di metadata.
4. **Jangan pakai query param untuk data utama** — pakai path param (mis. `/[slug]`, bukan `/?event=lanjalan-vol-1`).
5. **Path parameter harus slug-friendly** — lowercase, `a-z0-9-`, maksimal 60 karakter.
6. **Setiap halaman wajib punya `loading.tsx`** kalau fetch data lambat, dan `error.tsx` kalau bisa error.
7. **Semua route event harus handle state**: upcoming, live, past. Lihat `RULES.md`.

---

## 11. Referensi Cepat

| Butuh… | Lihat section |
|---|---|
| Daftar semua URL | 1 |
| Anchor halaman event | 2.1 |
| Daftar Server Actions | 3 |
| Daftar API | 4 |
| Redirect | 5 |
| Error pages | 6 |
| Middleware | 7 |
| SEO | 8 |
| Navigasi UI | 9 |

---

**Versi:** 1.0
**Terakhir diperbarui:** [tanggal]
**Pemilik:** Tim NGABINTON
