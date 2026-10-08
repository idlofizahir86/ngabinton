# `RULES.md`

# RULES — NGABINTON

> **Sumber kebenaran untuk semua aturan bisnis dan perilaku sistem.**
> File ini menjelaskan *bagaimana sistem harus berperilaku*, bukan *bagaimana strukturnya*.
> Struktur ada di `SCHEMA.md`, endpoint di `ROUTES.md`, keputusan teknis di `ARCHITECTURE.md`.
> Kalau ada aturan bisnis baru, tulis di sini dulu sebelum implementasi.

---

## 0. Ringkasan Cepat (TL;DR)

```yaml
Kategori aturan:
  Auth:         login, session, rate limit, password
  Event:        slug, publish, state, tampilan
  Presensi:     session lifecycle, session code, duplikat
  Form:         validasi semua input
  Access:       siapa boleh akses apa
  Content:      teks, gambar, tanggal
  Error:        pesan error, logging
  Time:         timezone, format tanggal

Prinsip:
  - Fail closed, not open
  - Validasi di server, bukan hanya client
  - Rate limit semua endpoint publik
  - Jangan bocorkan detail internal
```

---

## 1. Auth Rules

### 1.1 Login

**Aturan:**
1. Login hanya pakai **username + password**. Tidak ada email, tidak ada OAuth.
2. Username **case-sensitive**. `admin` ≠ `Admin`.
3. Password minimum 12 karakter untuk admin baru.
4. Login attempt dibatasi **5 kali per 5 menit per IP**.
5. Setelah 5 kali gagal, IP di-block selama 5 menit. Response: `429 Too Many Requests`.
6. Pesan error **seragam**: `"Username atau password salah."` — jangan bedakan antara user not found dan password wrong.
7. Login sukses → update `users.last_login_at`.
8. Login sukses → set cookie session (7 hari).
9. Login gagal → **jangan** log password (bahkan hash-nya).
10. Login gagal → log IP hash + timestamp untuk audit.

**Server Action signature** (dipakai dengan `useActionState`):
```ts
loginAction(prevState: LoginState, formData: FormData): Promise<LoginState>
// LoginState = { error: string | null }
// Sukses → set cookie session + redirect("/admin") (tidak mengembalikan nilai)
```

**Response codes:**
| Kondisi | Response |
|---|---|
| Sukses | `{ ok: true }` + set cookie + redirect `/admin` |
| Username/password salah | `{ error: "Username atau password salah." }` |
| Rate limited | `{ error: "Terlalu banyak percobaan. Coba lagi dalam 5 menit." }` |
| User tidak aktif (`is_active = false`) | `{ error: "Akun dinonaktifkan. Hubungi superadmin." }` |

---

### 1.2 Session

**Aturan:**
1. Session disimpan sebagai JWT di cookie `session`.
2. Cookie flags: `HttpOnly`, `Secure` (production), `SameSite=Lax`, `Path=/`.
3. Durasi: **7 hari**. Setelah itu harus login ulang.
4. JWT payload: `{ sub: userId, username, role, iat, exp }`.
5. JWT di-sign dengan `AUTH_SECRET` (HS256).
6. Session **tidak disimpan di DB**. JWT stateless.
7. Logout = clear cookie. Tidak ada server-side session store.
8. Kalau `AUTH_SECRET` di-rotate, semua session invalid. Admin harus login ulang.

**Aturan invalidasi:**
- Ubah password → session lama tetap valid sampai expired (kecuali ada mekanisme rotate yang lebih kompleks, itu non-goal).
- Nonaktifkan user (`is_active = false`) → session **tetap valid** sampai expired. Untuk force logout, harus hapus cookie manual + rotate `AUTH_SECRET`. Ini trade-off stateless JWT.

---

### 1.3 Middleware Protection

**Aturan:**
1. Semua route `/admin/*` wajib session valid.
2. Session invalid/expired → redirect `/login?redirect={path}`.
3. Redirect param hanya boleh path internal (`/admin/...`). Path eksternal di-ignore, fallback ke `/admin`.
4. Setelah login sukses, redirect ke `redirect` param (kalau valid), else `/admin`.
5. `/login` **tidak** diproteksi (pintu masuk).
6. Route `/api/*` tidak diproteksi middleware — proteksi di dalam handler masing-masing.

**Matcher:**
```ts
export const config = {
  matcher: ['/admin/:path*'],
};
```

---

### 1.4 Password

**Aturan:**
1. Hash pakai `bcryptjs` dengan cost factor **10**.
2. Jangan pernah simpan password plaintext di DB, log, atau komentar.
3. Ganti password wajib re-login (session lama di-invalidate secara eksplisit dengan clear cookie).
4. Password baru minimum 12 karakter. Tidak ada kompleksitas wajib (uppercase/symbol), cukup panjang.
5. Tidak ada fitur "lupa password" otomatis. Admin reset manual via seed script atau DB langsung.

---

## 2. Event Rules

### 2.1 Slug

**Aturan:**
1. Slug **immutable** — sekali dibuat, tidak boleh diubah.
2. Slug hanya boleh: `a-z`, `0-9`, `-`.
3. Panjang slug: 3–60 karakter.
4. Slug auto-generate dari title kalau tidak diisi manual.
5. Kalau slug sudah dipakai → tambah suffix `-2`, `-3`, dst.
6. Slug adalah identifier publik — muncul di URL, OG image, QR code.
7. Slug **tidak boleh** sama dengan reserved words: `admin`, `login`, `api`, `arsip`, `tentang`, `kontak`, `e`, `_next`, `sitemap.xml`, `robots.txt`, `opengraph-image`.

**Contoh valid:**
- `lanjalan-vol-1`
- `badminton-vol-12`
- `kopdar-2026`

**Contoh invalid:**
- `LanJalan Vol 1` (uppercase + spasi)
- `lanjalan_vol_1` (underscore)
- `admin` (reserved)

---

### 2.2 Publish

**Aturan:**
1. Event baru default `is_published = false` (draft).
2. Event harus di-publish manual oleh admin.
3. Event publish → muncul di landing, sitemap, dan bisa diakses via `/[slug]`.
4. Event unpublish → 404 di `/[slug]`, hilang dari landing.
5. Unpublish event yang sedang live (ada sesi presensi aktif) → tolak dengan error. Tutup sesi dulu.
6. Event hanya bisa di-publish kalau minimal: `title`, `starts_at`, `event_type`, `theme`.

**Aturan `is_featured`:**
1. Hanya **satu** event yang boleh `is_featured = true` dalam satu waktu.
2. Set event baru jadi featured → otomatis un-featured event lain.
3. Event featured muncul di hero landing.
4. Kalau tidak ada featured, hero landing pakai event upcoming paling dekat.

---

### 2.3 Event State

Setiap event punya state yang ditentukan dari waktu + status sesi.

**State definition:**
| State | Kondisi | CTA Utama | Tampilan |
|---|---|---|---|
| `draft` | `is_published = false` | — (tidak tampil publik) | Admin only |
| `upcoming` | `is_published = true` AND `now < starts_at` | "Daftar Sekarang" | Normal |
| `live` | `starts_at <= now <= ends_at` OR ada sesi presensi aktif | "Presensi Sekarang" + pulse dot | Live badge |
| `past` | `now > ends_at` AND tidak ada sesi aktif | "Lihat Dokumentasi" | Sedikit diredupkan |

**Aturan prioritas:**
1. Kalau ada sesi presensi aktif → `live`, apapun tanggalnya.
2. Kalau `now < starts_at` → `upcoming`.
3. Kalau `starts_at <= now <= ends_at` → `live`.
4. Kalau `now > ends_at` → `past`.

**Contoh:**
- Event tanggal 15 Nov, hari ini 10 Nov, sesi belum buka → `upcoming`
- Event tanggal 15 Nov, hari ini 10 Nov, admin buka sesi lebih awal → `live`
- Event tanggal 15 Nov, hari ini 16 Nov, sesi tutup → `past`

---

### 2.4 Event Delete

**Aturan:**
1. Hapus event hanya boleh oleh `admin` atau `superadmin`.
2. Hapus event = cascade delete: `rundown_items`, `budget_items`, `event_media`, `event_extras`, `attendance_sessions`, `attendances`.
3. Konfirmasi dialog wajib: "Yakin hapus event [nama]? Semua data rundown, biaya, dan presensi akan hilang permanen."
4. Setelah hapus → redirect `/admin/events`.
5. Hapus event yang sedang live (ada sesi aktif) → tolak. Tutup sesi dulu.
6. File media di Supabase Storage **tidak** otomatis terhapus (harus manual cleanup). Ini trade-off untuk performa — non-goal untuk sekarang.

---

## 3. Presensi Rules

### 3.1 Session Lifecycle

**Aturan:**
1. Satu event bisa punya **banyak sesi** (mis. hari 1, hari 2).
2. Hanya **satu sesi aktif** per event dalam satu waktu.
3. Buka sesi baru → tutup otomatis sesi lama yang masih aktif.
4. Sesi punya state: `inactive`, `active`, `closed`.
   - `inactive`: belum pernah dibuka
   - `active`: `is_active = true`, `opened_at` terisi
   - `closed`: `is_active = false`, `closed_at` terisi
5. Sesi bisa dibuka **kapan saja**, tidak terikat tanggal event.
6. Sesi yang sudah closed **tidak bisa** dibuka ulang. Bikin sesi baru.
7. `auto_close_at` opsional. Kalau diisi, sesi otomatis tutup saat waktu itu.

**Aturan auto-close:**
- Cek auto-close saat request masuk (lazy evaluation), bukan cron.
- Kalau `now > auto_close_at` dan `is_active = true` → set `is_active = false`, `closed_at = now()`.

---

### 3.2 Session Code

**Aturan:**
1. Format: 6 karakter, uppercase.
2. Charset: `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (31 karakter, tanpa `0/O`, `1/I/L`).
3. Setiap sesi baru → generate code baru.
4. Code **unique** across all sessions (termasuk yang closed).
5. Kalau `refreshSessionCodeAction` dipanggil → generate code baru, code lama tidak valid lagi.
6. QR code berisi URL: `{APP_URL}/e/{slug}/absen?code={sessionCode}`.

**Contoh code valid:**
- `A3KMNP`
- `B7XY9R`

**Contoh code invalid:**
- `A3KMNP0` (ada `0`)
- `a3kmnp` (lowercase)
- `A3K-MNP` (ada tanda hubung)

---

### 3.3 Submit Attendance

**Alur lengkap:**
```
1. Rate limit check (5 submit / menit / IP)
   → Kalau lewat, return { error: 'rate_limited' }
2. Cari session by code
   → Kalau tidak ada, return { error: 'invalid_code' }
3. Cek session.is_active
   → Kalau false, return { error: 'session_closed' }
4. Cek session.auto_close_at
   → Kalau now > auto_close_at, tutup sesi, return { error: 'session_closed' }
5. Validate input (Zod)
   → Kalau invalid, return { error: 'invalid_input', fields: {...} }
6. Cek duplikat:
   a. Kalau phone diisi → cari by (session_id, phone)
   b. Kalau phone kosong → cari by (session_id, name, ip_hash)
   → Kalau ada, return { error: 'duplicate', data: { name, checked_in_at } }
7. Insert attendance
8. Revalidate path /[slug]/absen
9. Return { ok: true, name, checked_in_at }
```

**Aturan duplikat:**
1. Duplikat **tidak** dianggap error merah. Ini warning kuning.
2. Response `duplicate` termasuk data existing (`name`, `checked_in_at`) supaya UI bisa tampilkan "Kamu sudah absen pada 07.12 WIB".
3. Peserta tetap boleh pulang dengan status hadir (dari submit pertama).

**Aturan anti-spam:**
1. Rate limit per IP: 5 submit / menit.
2. Rate limit per session: 200 submit / jam (mencegah serangan bot).
3. `ip_hash` = `sha256(ip + AUTH_SECRET)`. Jangan simpan IP mentah.
4. `user_agent` disimpan untuk debugging tapi tidak ditampilkan.

**Aturan data:**
1. `name` wajib, min 2 karakter, max 100 karakter.
2. `phone` opsional. Kalau diisi: min 10 digit, max 15 digit, hanya `0-9`, `+`, `-`, spasi.
3. Normalisasi phone sebelum simpan: hapus spasi, `-`, `+`. Kalau mulai dengan `62`, convert ke `0`.
   - `+62 812-3456-7890` → `08123456789 0` → `08123456789`
   - `62812-3456-7890` → `08123456789`
4. `brings_gift` default `false`. Hanya dipakai untuk event travel dengan fitur tukar kado.

---

### 3.4 Delete Attendance

**Aturan:**
1. Hanya admin yang bisa hapus baris kehadiran.
2. Konfirmasi dialog wajib: "Yakin hapus kehadiran [nama]?"
3. Setelah hapus → revalidate `/[slug]/absen` dan `/admin/events/[id]/attendance`.
4. Hapus kehadiran **tidak** mengubah `session_code` atau status sesi.

---

### 3.5 Sesi Tutup — Apa yang Terjadi

**Aturan:**
1. Set `is_active = false`, `closed_at = now()`.
2. Halaman `/[slug]/absen` untuk sesi ini → tampilkan pesan "Presensi sudah ditutup".
3. QR code yang lama → tidak valid.
4. Peserta baru yang coba submit → `{ error: 'session_closed' }`.
5. Peserta yang **sudah** absen → tetap bisa akses halaman (state sukses).
6. Admin tetap bisa lihat daftar kehadiran.
7. Admin **tidak bisa** buka ulang sesi ini. Harus bikin sesi baru.

---

## 4. Form Validation Rules

Semua input divalidasi dengan Zod. Validasi di server **wajib**, di client opsional (untuk UX).

### 4.1 Event Form

| Field | Tipe | Aturan |
|---|---|---|
| `title` | string | 3–200 char, wajib |
| `subtitle` | string | max 200 char, opsional |
| `slug` | string | 3–60 char, `a-z0-9-`, unique, immutable |
| `description` | string | max 5000 char |
| `event_type` | enum | `badminton` \| `travel` \| `gathering` |
| `theme` | enum | `cinema` \| `storytelling` |
| `starts_at` | date | wajib, harus di masa depan untuk event baru |
| `ends_at` | date | opsional, harus > `starts_at` |
| `price` | number | opsional, min 0, max 10.000.000 |
| `quota` | number | opsional, min 1, max 1000 |
| `meeting_point` | string | wajib kalau `event_type = 'travel'` |
| `meeting_time` | string | format `HH.MM WIB`, wajib kalau travel |
| `return_time` | string | format `HH.MM WIB`, opsional |
| `transport_mode` | string | wajib kalau travel |
| `location` | string | max 200 char |

### 4.2 Rundown Form

| Field | Aturan |
|---|---|
| `time` | wajib, max 30 char (bisa "06.00" atau "06.00 – 08.30") |
| `title` | wajib, 3–200 char |
| `note` | opsional, max 500 char |
| `order` | integer, unik per event |
| `is_optional` | boolean |

### 4.3 Budget Form

| Field | Aturan |
|---|---|
| `label` | wajib, 3–100 char |
| `amount` | integer, min 0, max 100.000.000 |
| `is_total` | boolean, hanya satu yang boleh `true` per event |
| `order` | integer, unik per event |

### 4.4 Attendance Form

| Field | Aturan |
|---|---|
| `name` | wajib, 2–100 char |
| `phone` | opsional, 10–15 digit, normalize |
| `email` | opsional, format email valid, max 100 char |
| `organization` | opsional, max 100 char |
| `brings_gift` | boolean |

### 4.5 Auth Form

| Field | Aturan |
|---|---|
| `username` | wajib, 3–50 char, `a-z0-9_` |
| `password` | wajib, min 12 char untuk ganti password |
| `oldPassword` | wajib untuk ganti password |

### 4.6 Aturan Validasi Umum

1. **Whitespace trimming** otomatis untuk semua string.
2. **HTML escape** untuk semua input yang akan ditampilkan (Next.js sudah handle by default).
3. **Reject** input dengan karakter kontrol (`\0`–`\x1F` kecuali `\n`, `\t`).
4. **Max length** wajib untuk semua string field (default 1000).
5. **Min length** wajib untuk nama & title (default 2).
6. Pesan error dalam Bahasa Indonesia, format: `"Nama minimal 2 karakter."`

---

## 5. Access Control Rules

### 5.1 Role Definition

| Role | Bisa apa |
|---|---|
| `admin` | Kelola event, buka/tutup sesi, lihat & export kehadiran |
| `superadmin` | Semua yang admin bisa + kelola admin lain, ganti konfigurasi |

**Untuk sekarang:** semua user = `admin`. `superadmin` di-reserve.

### 5.2 Aturan Akses

| Aksi | Public | Admin | Superadmin |
|---|---|---|---|
| Lihat landing | ✅ | ✅ | ✅ |
| Lihat halaman event publish | ✅ | ✅ | ✅ |
| Lihat halaman event draft | ❌ | ✅ | ✅ |
| Submit presensi | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| Lihat dashboard | ❌ | ✅ | ✅ |
| Create event | ❌ | ✅ | ✅ |
| Edit event | ❌ | ✅ | ✅ |
| Delete event | ❌ | ✅ | ✅ |
| Buka/tutup sesi | ❌ | ✅ | ✅ |
| Lihat daftar kehadiran | ❌ | ✅ | ✅ |
| Export CSV | ❌ | ✅ | ✅ |
| Hapus kehadiran | ❌ | ✅ | ✅ |
| Kelola admin lain | ❌ | ❌ | ✅ |

### 5.3 Aturan Data Leakage

1. **Jangan pernah** kirim `password_hash` ke client (bahkan di Server Component).
2. **Jangan pernah** kirim `session.session_code` ke client public — hanya admin yang boleh lihat.
3. **Jangan pernah** tampilkan `ip_hash` di UI.
4. Peserta **tidak bisa** lihat daftar kehadiran lengkap (hanya konfirmasi namanya sendiri).
5. Error message tidak boleh menyebut nama tabel, kolom, atau detail internal.

---

## 6. Content Rules

### 6.1 Teks

1. Semua teks UI dalam **Bahasa Indonesia**.
2. Istilah teknis boleh Inggris: "QR Code", "CSV", "email", "username", "password".
3. Format tanggal: `Sabtu, 12 Oktober 2026 · 19.00 WIB`.
4. Format waktu: `19.00` (titik, bukan titik dua).
5. Format uang: `Rp 175.000` (titik sebagai pemisah ribuan, tidak ada desimal).
6. Format tanggal di rundown: `06.00 – 08.30` (spasi di sekitar en-dash).
7. Tidak ada singkatan tidak baku: "yg", "dgn", "utk" → tulis lengkap.
8. Boleh bahasa gaul ringan: "yuk", "bareng", "nggak", "nih".

### 6.2 Gambar

1. Format: WebP (convert di server).
2. Max size: 5MB sebelum convert.
3. Aspect ratio:
   - Hero: 16:9 atau 21:9
   - Poster card: 16:9
   - Cover/OG: 1200×630
   - Destinasi: 4:3
   - Peserta: 1:1
4. `alt` wajib untuk semua gambar.
5. Foto peserta **tidak** disertai nama (privacy default).

### 6.3 Metadata SEO

1. Setiap halaman publik punya `<title>` dan `<meta description>`.
2. Title format: `{Judul Event} — NGABINTON`
3. Description: dari `event.subtitle` atau auto-generated.
4. OG image: dari `event.cover_image_url` atau `/og/default.jpg`.

---

## 7. Error Handling Rules

### 7.1 Pesan Error

| Jenis | Pesan | Ditampilkan di |
|---|---|---|
| Validasi input | Spesifik per field | Bawah field |
| Auth gagal | "Username atau password salah." | Toast / inline |
| Rate limit | "Terlalu banyak percobaan. Coba lagi dalam 5 menit." | Toast |
| Sesi tutup | "Presensi sudah ditutup." | Full page |
| Duplikat | "Kamu sudah tercatat hadir pada {waktu}." | Card warning |
| Kode invalid | "Kode presensi tidak valid." | Form |
| Not found | "Halaman tidak ditemukan." | 404 page |
| Server error | "Ada yang salah. Coba lagi nanti." | Error page |

### 7.2 Aturan Logging

1. **Log di server** untuk: login attempt, error 500, rate limit trigger, submit presensi gagal.
2. **Jangan log** password, session token, atau data pribadi.
3. Log format: `{level}:{timestamp}:{event}:{detail}` — pakai `lib/logger.ts`.
4. Log tidak disimpan di DB. Hanya console (ditangkap Vercel).
5. Untuk audit kritis (login sukses), simpan di `users.last_login_at`.

### 7.3 Error Page

1. Error page publik tetap pakai navbar + footer.
2. Error page admin tetap pakai sidebar.
3. Jangan tampilkan stack trace di production.
4. Selalu sediakan tombol "Kembali" atau "Coba lagi".

---

## 8. Time & Timezone Rules

### 8.1 Timezone

1. **Semua timestamp di DB** disimpan sebagai `timestamptz` (UTC).
2. **Timezone aplikasi:** `Asia/Jakarta` (WIB, UTC+7).
3. Konversi ke WIB **hanya saat render**, bukan saat simpan.
4. Format output: `19.00 WIB` (dengan label WIB).

### 8.2 Format Tanggal

| Konteks | Format | Contoh |
|---|---|---|
| Tanggal lengkap | `EEEE, d MMMM yyyy` | Sabtu, 12 Oktober 2026 |
| Tanggal + waktu | `EEEE, d MMMM yyyy · HH.mm` | Sabtu, 12 Oktober 2026 · 19.00 |
| Waktu saja | `HH.mm` | 19.00 |
| Rentang waktu | `HH.mm – HH.mm` | 06.00 – 08.30 |
| Relatif | `formatDistanceToNow` | "2 jam lagi", "kemarin" |

Library: `date-fns` dengan locale `id`.

### 8.3 Batas Waktu

1. **Event baru** tidak boleh `starts_at` di masa lalu (untuk create).
2. **Event edit** boleh ubah `starts_at` ke masa lalu (untuk koreksi).
3. **Sesi presensi** bisa dibuka kapan saja, tidak terikat tanggal.
4. **Auto-close** dihitung dari `opened_at`, bukan `starts_at`.

---

## 9. Rate Limiting Rules

Semua rate limit pakai Upstash Redis.

| Endpoint | Limit | Window | Key |
|---|---|---|---|
| Login | 5 | 5 menit | `ratelimit:login:{ip}` |
| Submit presensi | 5 | 1 menit | `ratelimit:attendance:{ip}` |
| Submit presensi (per session) | 200 | 1 jam | `ratelimit:attendance:session:{sessionId}` |
| Refresh session code | 10 | 1 menit | `ratelimit:refresh:{userId}` |
| Export CSV | 5 | 1 menit | `ratelimit:export:{userId}` |

**Aturan:**
1. Rate limit dihitung per **IP** (bukan user) untuk endpoint publik.
2. Rate limit dihitung per **user id** untuk endpoint admin.
3. Response rate limited: `429` + pesan ramah.
4. Jangan reset counter saat login sukses — biarkan expire natural.

---

## 10. Data Integrity Rules

### 10.1 Cascade Delete

| Hapus | Otomatis hapus |
|---|---|
| `events` | `rundown_items`, `budget_items`, `event_media`, `event_extras`, `attendance_sessions`, `attendances` |
| `attendance_sessions` | `attendances` |
| `users` | Tidak cascade (set `created_by = NULL`) |

### 10.2 Unique Constraints

| Tabel | Kolom | Aturan |
|---|---|---|
| `users` | `username` | Unique |
| `events` | `slug` | Unique |
| `attendance_sessions` | `session_code` | Unique globally (bukan per event) |
| `rundown_items` | `(event_id, order)` | Unique |
| `budget_items` | `(event_id, order)` | Unique |
| `event_extras` | `(event_id, key)` | Unique |
| `attendances` | `(session_id, phone)` | Unique partial (kalau phone diisi) |

### 10.3 Business Invariants

1. **Satu sesi aktif per event.** Kalau buka sesi baru, sesi lama harus tutup.
2. **Satu featured event.** Set featured → un-featured yang lain.
3. **Satu total row per budget.** Kalau ada `is_total = true`, hanya boleh satu per event.
4. **Order unik per event.** Untuk rundown & budget.

**Enforcement:**
- Invariant 1, 2, 3: enforce di Server Action (transaction).
- Invariant 4: enforce di DB (unique index).

---

## 11. Business Logic Edge Cases

### 11.1 Event Multi-Hari

**Skenario:** Event badminton 2 hari, masing-masing hari punya sesi presensi.

**Aturan:**
- Satu event, banyak sesi (label "Hari 1", "Hari 2").
- Presensi hari 1 dan hari 2 terpisah.
- Peserta bisa absen di hari 1 saja, hari 2 saja, atau keduanya.
- Counter di admin per sesi, bukan per event.

### 11.2 Sesi Dibuka Sebelum Event

**Skenario:** Admin buka sesi 3 hari sebelum event.

**Aturan:**
- Boleh. Tidak ada batasan waktu buka.
- Event state jadi `live` saat sesi aktif (lihat section 2.3).
- CTA utama berubah jadi "Presensi Sekarang".
- Peserta yang absen awal = tercatat.

### 11.3 Peserta Absen Dua Kali dengan Nomor Berbeda

**Skenario:** Peserta absen dengan nomor A, lalu absen lagi dengan nomor B.

**Aturan:**
- Kalau nomor A dan B berbeda → dianggap dua orang berbeda.
- Duplikat hanya terdeteksi kalau nomor sama persis (setelah normalisasi).
- Ini trade-off. Cegah penyalahgunaan berat, tapi tidak sempurna.

### 11.4 Peserta Absen dengan Nama Sama, Nomor Kosong

**Skenario:** Dua peserta nama "Budi", keduanya tidak isi nomor HP.

**Aturan:**
- Duplikat check: `(session_id, name, ip_hash)`.
- Kalau IP berbeda → dianggap dua orang berbeda.
- Kalau IP sama → dianggap duplikat (kemungkinan orang sama submit dua kali).
- Peserta kedua diarahkan ke `<AttendanceDuplicate />`.

### 11.5 Admin Lupa Tutup Sesi

**Skenario:** Event selesai, tapi sesi masih `is_active = true`.

**Aturan:**
- `auto_close_at` handle ini kalau diisi.
- Kalau tidak diisi, sesi tetap aktif sampai admin tutup manual.
- Tidak ada auto-close berdasarkan `ends_at` event (bisa jadi peserta absen setelah event).
- Admin bisa tutup sesi kapan saja.

### 11.6 Refresh Session Code

**Skenario:** Admin refresh QR code (mis. karena khawatir QR lama tersebar).

**Aturan:**
- Generate `session_code` baru.
- Code lama **tetap valid** sampai expired secara natural (tidak dihapus dari DB) — karena peserta yang sudah scan mungkin masih di halaman form.
- Sebenarnya: **code lama tidak valid** untuk submit baru. Peserta yang submit dengan code lama → `invalid_code`.
- Reset: sebaiknya jangan refresh code saat sedang banyak peserta di halaman form.

### 11.7 Event Travel tanpa Tukar Kado

**Skenario:** Event travel tapi tanpa fitur tukar kado.

**Aturan:**
- Jangan set `event_extras` dengan key `gift_exchange`.
- Form presensi: `brings_gift` tidak ditampilkan.
- Section `#kado` di halaman event: tidak tampil.
- Tampilan otomatis menyesuaikan.

### 11.8 Event Badminton tanpa Rundown

**Skenario:** Event badminton simpel, tanpa rundown.

**Aturan:**
- Section `#rundown` disembunyikan kalau `rundown_items.length === 0`.
- Anchor `#rundown` di sub-navbar: disembunyikan.
- Empty state tidak ditampilkan (mendingan tidak ada section).

---

## 12. Aturan Khusus NGABINTON

### 12.1 Ayat Quran (Event Travel)

1. Setiap event travel **sebaiknya** punya ayat pembuka (tidak wajib).
2. Kalau ada, simpan di `event_extras.quran_verse` dengan format `{ arabic, translation, source }`.
3. Terjemahan wajib ada. Jangan tampilkan Arab saja.
4. Sumber wajib disebutkan (mis. "Q.S Al Mulk : 15").
5. Font Arabic: `Noto Naskh Arabic`, direction RTL.

### 12.2 Tukar Kado (Event Travel)

1. Budget kado: default Rp 10.000 – Rp 15.000.
2. Unisex — tidak spesifik gender.
3. Wajib bawa 1 kado per peserta.
4. Ditukar saat makan siang.
5. Info ini disimpan di `event_extras.gift_exchange`.

### 12.3 Transportasi (Event Travel)

1. Kalau naik angkot/sewa kendaraan, titik jemput disimpan di `event_extras.pickup_points`.
2. Titik jemput utama (base) disebut **Vasati Rabbani** — bisa berubah per event.
3. Titik jemput adalah array string.

### 12.4 Biaya (Semua Event)

1. Biaya default: harga per orang, integer rupiah.
2. Total dihitung dari `budget_items`, tidak disimpan di `events`.
3. Kalau ada baris `is_total = true`, itu nilai total yang ditampilkan.
4. Info pembayaran (rekening, deadline) di `event_extras.payment_info`.

---

## 13. Non-Goals (Yang TIDAK Diatur di Sini)

Rule-rule berikut sengaja **tidak** dibuat karena di luar scope:

- ❌ Multi-bahasa (i18n)
- ❌ Multi-tenant
- ❌ Custom roles / permission granular
- ❌ Approval workflow (event perlu di-approve)
- ❌ Notifikasi email / WhatsApp otomatis
- ❌ Refund / cancellation
- ❌ Payment gateway
- ❌ Waiting list / quota enforcement otomatis
- ❌ Recurring events (event berulang otomatis)
- ❌ Event series / parent-child event

---

## 14. Referensi Cepat

| Butuh… | Lihat section |
|---|---|
| Auth | 1 |
| Event | 2 |
| Presensi | 3 |
| Validasi form | 4 |
| Access control | 5 |
| Konten | 6 |
| Error | 7 |
| Waktu | 8 |
| Rate limit | 9 |
| Data integrity | 10 |
| Edge cases | 11 |
| Khusus NGABINTON | 12 |

---

**Versi:** 1.0
**Terakhir diperbarui:** [tanggal]
**Pemilik:** Tim NGABINTON