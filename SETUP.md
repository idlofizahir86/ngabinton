# `SETUP.md`

# SETUP — NGABINTON

> **Panduan setup lokal dari nol sampai deploy.**
> Ikuti urutan ini. Kalau ada error, cek section 11 (Troubleshooting) dulu.
> Estimasi waktu: 30–45 menit untuk setup pertama kali.

---

## 0. Ringkasan Cepat (TL;DR)

```yaml
Prerequisites:
  - Node.js 20.x
  - pnpm 9.x
  - Akun Supabase (free)
  - Akun Upstash (free)
  - Akun Vercel (free)
  - Git

Alur:
  1. Clone repo & install dependencies
  2. Setup Supabase project
  3. Setup Upstash Redis
  4. Isi .env.local
  5. Migrate DB
  6. Seed admin
  7. Run dev server

Estimasi:  30–45 menit (pertama kali)
```

---

## 1. Prerequisites

### 1.1 Yang Wajib Diinstall

| Tool | Versi | Cara install |
|---|---|---|
| **Node.js** | 20.x LTS | [nodejs.org](https://nodejs.org) atau `nvm install 20` |
| **pnpm** | 9.x | `npm install -g pnpm` |
| **Git** | Any | [git-scm.com](https://git-scm.com) |

### 1.2 Akun yang Dibutuhkan

| Layanan | Fungsi | Tier |
|---|---|---|
| **Supabase** | Postgres + Storage + Realtime | Free |
| **Upstash** | Redis untuk rate limit | Free |
| **Vercel** | Hosting | Hobby (free) |
| **GitHub** | Repo | Free |

**Total biaya setup:** Rp 0.

### 1.3 Verifikasi Instalasi

```bash
node -v      # harus v20.x.x
pnpm -v      # harus 9.x.x atau lebih baru
git --version
```

Kalau salah satu tidak keluar, install dulu sebelum lanjut.

---

## 2. Clone Repo & Install Dependencies

### 2.1 Clone

```bash
git clone https://github.com/<username>/ngabinton.git
cd ngabinton
```

### 2.2 Install

```bash
pnpm install
```

**Expected output:**
```
Packages: +350
Progress: resolved 350, reused 320, downloaded 30
Done in 15s
```

### 2.3 Verifikasi

```bash
ls -la
# Harus ada: package.json, pnpm-lock.yaml, src/, public/, dll
```

---

## 3. Setup Supabase

### 3.1 Buat Project

1. Login ke [supabase.com](https://supabase.com)
2. Klik **"New Project"**
3. Isi:
   - **Name:** `ngabinton`
   - **Database Password:** generate kuat (simpan!)
   - **Region:** `Southeast Asia (Singapore)` — terdekat ke Indonesia
   - **Pricing Plan:** Free
4. Tunggu ~2 menit sampai project ready

### 3.2 Ambil Credentials

Masuk ke project → **Settings** → **API**.

Yang perlu di-copy:

| Field di Supabase | Untuk env var | Catatan |
|---|---|---|
| `Project URL` | `SUPABASE_URL` | Format: `https://xxx.supabase.co` |
| `anon public` | `SUPABASE_ANON_KEY` | Public, aman dipakai di client |
| `service_role` | `SUPABASE_SERVICE_ROLE_KEY` | **RAHASIA** — jangan share |

### 3.3 Ambil Connection String

Masuk ke **Settings** → **Database** → **Connection string**.

Pilih tab **"Connection pooling"** (bukan "Direct connection").

| Field | Nilai |
|---|---|
| **Mode** | Transaction |
| **Port** | 6543 |
| **String** | Copy full string |

Format:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

Ganti `[YOUR-PASSWORD]` dengan password DB yang kamu set di step 3.1.

> ⚠️ **Penting:** Gunakan **pooler** (port 6543), bukan direct (port 5432). Vercel serverless butuh pooler untuk hindari connection limit.

### 3.4 Setup Storage Bucket

1. Masuk ke **Storage** di sidebar
2. Klik **"New bucket"**
3. Name: `public`
4. **Public bucket:** ✅ ON
5. Klik **"Create bucket"**

Bucket ini untuk poster & foto event.

### 3.5 Realtime — TIDAK DIPAKAI

Counter kehadiran memakai **Server-Sent Events** (`/api/attendance/stream/[sessionId]`), bukan Supabase Realtime — lihat `ARCHITECTURE.md` ADR-010. Jadi **tidak perlu** mengaktifkan Realtime di dashboard.

> Tambahan (keamanan): aktifkan **RLS tanpa policy** di semua tabel `public` supaya anon key tidak bisa membaca data via PostgREST/Realtime. (Sudah dilakukan pada setup awal.)

---

## 4. Setup Upstash Redis

### 4.1 Buat Database

1. Login ke [upstash.com](https://upstash.com)
2. Klik **"Create Database"**
3. Isi:
   - **Name:** `ngabinton-ratelimit`
   - **Type:** Regional
   - **Region:** `ap-southeast-1` (Singapore)
   - **TLS:** ON
4. Klik **"Create"**

### 4.2 Ambil Credentials

Masuk ke database → tab **"REST API"** → **"Node"**.

Copy:
- `UPSTASH_REDIS_REST_URL` → `UPSTASH_REDIS_URL`
- `UPSTASH_REDIS_REST_TOKEN` → `UPSTASH_REDIS_TOKEN`

---

## 5. Setup Environment Variables

### 5.1 Copy Template

```bash
cp .env.example .env.local
```

### 5.2 Isi `.env.local`

```bash
# Database (dari Supabase — pakai pooler!)
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Auth — generate dengan: openssl rand -base64 32
AUTH_SECRET="isi-dengan-string-random-32-byte"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIs..."

# Upstash Redis
UPSTASH_REDIS_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_TOKEN="AXxxxx..."

# Seed (dev only — jangan commit password asli)
SEED_ADMIN_USERNAME="admin"
SEED_ADMIN_PASSWORD="ganti-dengan-password-kuat-min-12-char"
```

### 5.3 Generate `AUTH_SECRET`

**macOS / Linux:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Atau pakai Node:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy output ke `AUTH_SECRET`.

### 5.4 Verifikasi `.env.local`

```bash
cat .env.local | grep -E "^(DATABASE_URL|AUTH_SECRET|SUPABASE_URL|UPSTASH_REDIS_URL)"
```

Pastikan semua terisi. Kalau ada yang kosong, ulangi step terkait.

> ⚠️ **Jangan commit `.env.local`.** Sudah ada di `.gitignore`.

---

## 6. Migrate Database

### 6.1 Generate Migration (kalau belum ada)

```bash
pnpm drizzle-kit generate
```

Output: file SQL di `drizzle/` folder.

### 6.2 Apply ke Supabase

```bash
pnpm drizzle-kit push
```

**Expected output:**
```
[✓] Pulling schema from database...
[✓] Changes applied
```

### 6.3 Verifikasi

1. Buka Supabase Studio → **Table Editor**
2. Pastikan 8 tabel ada:
   - `users`
   - `events`
   - `rundown_items`
   - `budget_items`
   - `event_media`
   - `event_extras`
   - `attendance_sessions`
   - `attendances`

Kalau ada yang hilang, cek `SCHEMA.md` dan ulangi generate.

---

## 7. Seed Database

### 7.1 Jalankan Seed

```bash
pnpm tsx scripts/seed.ts
```

**Expected output:**
```
✅ Admin user created: admin
✅ Event created: lanjalan-vol-1
✅ Rundown: 6 items
✅ Budget: 7 items
✅ Extras: 4 keys
✅ Seed selesai
```

### 7.2 Verifikasi

1. Buka Supabase → **Table Editor** → `users`
2. Harus ada 1 baris dengan `username = "admin"`
3. Buka tabel `events`, harus ada `lanjalan-vol-1`

### 7.3 Catatan Seed

- Seed **idempotent** — bisa dijalankan berkali-kali tanpa duplikasi (`onConflictDoNothing`).
- Kalau mau reset admin password, hapus baris di `users` lalu seed ulang.
- Untuk production, jalankan seed dengan env production, lalu **ganti password** segera.

---

## 8. Run Dev Server

### 8.1 Start

```bash
pnpm dev
```

**Expected output:**
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

### 8.2 Test Halaman

Buka di browser:

| URL | Yang harus muncul |
|---|---|
| `http://localhost:3000` | Landing page (hero + carousel) |
| `http://localhost:3000/lanjalan-vol-1` | Halaman event travel |
| `http://localhost:3000/lanjalan-vol-1/absen` | Pesan "Presensi belum dibuka" |
| `http://localhost:3000/login` | Form login admin |
| `http://localhost:3000/admin` | Redirect ke `/login` (belum login) |

### 8.3 Test Login

1. Buka `http://localhost:3000/login`
2. Isi:
   - Username: `admin`
   - Password: (yang kamu set di `.env.local`)
3. Klik "Masuk"
4. Harus redirect ke `/admin` dan tampil dashboard

Kalau login gagal, cek:
- Password hash di DB cocok
- Cookie `session` ke-set di browser DevTools → Application → Cookies
- `AUTH_SECRET` di `.env.local` tidak kosong

---

## 9. Commands Referensi

| Command | Fungsi |
|---|---|
| `pnpm dev` | Run dev server |
| `pnpm build` | Build production |
| `pnpm start` | Run production build lokal |
| `pnpm lint` | Jalankan ESLint |
| `pnpm typecheck` | Cek TypeScript |
| `pnpm drizzle-kit generate` | Generate migration |
| `pnpm drizzle-kit push` | Apply schema ke DB (dev) |
| `pnpm drizzle-kit migrate` | Apply migration (production) |
| `pnpm drizzle-kit studio` | Buka Drizzle Studio (GUI DB) |
| `pnpm tsx scripts/seed.ts` | Seed database |
| `pnpm tsx scripts/hash-password.ts <password>` | Generate bcrypt hash |

### 9.1 Tambahan `package.json` Scripts

Pastikan `package.json` punya:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed.ts"
  }
}
```

---

## 10. Deploy ke Vercel

### 10.1 Push ke GitHub

```bash
git add .
git commit -m "chore: initial setup"
git push origin main
```

### 10.2 Connect ke Vercel

1. Login ke [vercel.com](https://vercel.com)
2. Klik **"Add New Project"**
3. Import repo dari GitHub
4. **Framework Preset:** Next.js (auto-detect)
5. **Root Directory:** `./` (default)
6. **Build Command:** `pnpm build` (auto)
7. **Install Command:** `pnpm install --frozen-lockfile`
8. Klik **"Environment Variables"** → tambahkan semua dari `.env.local`:

| Key | Value |
|---|---|
| `DATABASE_URL` | (dari Supabase pooler) |
| `AUTH_SECRET` | (string 32 byte) |
| `NEXT_PUBLIC_APP_URL` | `https://ngabinton.vercel.app` (atau custom domain) |
| `SUPABASE_URL` | — |
| `SUPABASE_ANON_KEY` | — |
| `SUPABASE_SERVICE_ROLE_KEY` | — |
| `UPSTASH_REDIS_URL` | — |
| `UPSTASH_REDIS_TOKEN` | — |

**JANGAN** tambahkan `SEED_ADMIN_*` di Vercel. Itu untuk dev only.

9. Klik **"Deploy"**
10. Tunggu ~2 menit

### 10.3 Set Region

Setelah deploy sukses:

1. Project Settings → **Functions** → **Region**
2. Pilih **Singapore (sin1)**
3. Redeploy

### 10.4 Custom Domain (opsional)

1. Settings → **Domains**
2. Add domain (mis. `ngabinton.id`)
3. Update DNS record di registrar domain
4. Update `NEXT_PUBLIC_APP_URL` di env vars
5. Redeploy

### 10.5 Seed Production

**Hati-hati:** ini mengubah DB production.

```bash
# Pakai env production
DATABASE_URL="postgresql://...pooler..." \
SEED_ADMIN_USERNAME="admin" \
SEED_ADMIN_PASSWORD="password-super-kuat" \
pnpm tsx scripts/seed.ts
```

Setelah seed, **langsung login dan ganti password**.

### 10.6 Smoke Test

Buka production URL, test:
- [ ] Landing page render
- [ ] Halaman `/lanjalan-vol-1` render
- [ ] Login admin berhasil
- [ ] Bikin event test
- [ ] Buka sesi QR
- [ ] Scan QR dari HP → absen
- [ ] Counter naik realtime
- [ ] Export CSV
- [ ] Hapus event test

---

## 11. Troubleshooting

### 11.1 Error: `ECONNREFUSED` atau `too many connections`

**Penyebab:** pakai direct connection (port 5432) bukan pooler (port 6543).

**Solusi:**
1. Cek `DATABASE_URL` di `.env.local`
2. Pastikan ada `.pooler.supabase.com` dan port `6543`
3. Kalau masih error, cek Supabase → Settings → Database → Connection pooling aktif

---

### 11.2 Error: `relation "users" does not exist`

**Penyebab:** migration belum dijalankan.

**Solusi:**
```bash
pnpm drizzle-kit push
```

---

### 11.3 Error: `AUTH_SECRET is not defined`

**Penyebab:** `.env.local` tidak dibaca atau `AUTH_SECRET` kosong.

**Solusi:**
1. Cek file `.env.local` ada di root
2. Restart dev server (`Ctrl+C` lalu `pnpm dev`)
3. Cek `AUTH_SECRET` tidak kosong

---

### 11.4 Login gagal terus

**Kemungkinan penyebab:**
1. Password salah — cek `SEED_ADMIN_PASSWORD` di `.env.local`
2. Hash tidak cocok — jalankan ulang seed
3. Cookie tidak ke-set — cek DevTools → Application → Cookies

**Solusi cepat:**
```bash
# Reset admin
# Hapus baris di tabel users via Supabase Studio
# Jalankan seed ulang
pnpm tsx scripts/seed.ts
```

---

### 11.5 Supabase Realtime tidak jalan

**Penyebab:** tabel belum di-enable realtime.

**Solusi:**
1. Supabase → Database → Replication
2. Enable untuk `attendances` dan `attendance_sessions`
3. Restart dev server

---

### 11.6 QR Code tidak muncul

**Penyebab:** library `qrcode` gagal generate, atau URL tidak valid.

**Solusi:**
1. Cek `NEXT_PUBLIC_APP_URL` di `.env.local`
2. Cek console browser untuk error
3. Test manual:
   ```bash
   node -e "require('qrcode').toDataURL('test').then(console.log)"
   ```

---

### 11.7 File upload gagal

**Penyebab:** Supabase Storage bucket belum dibuat atau permission salah.

**Solusi:**
1. Supabase → Storage → pastikan bucket `public` ada
2. Cek bucket setting: **Public bucket** harus ON
3. Cek `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`

---

### 11.8 Build error di Vercel tapi lokal OK

**Kemungkinan penyebab:**
1. Env var lupa di-set di Vercel
2. Node version beda
3. Cache build kotor

**Solusi:**
1. Cek semua env var di Vercel dashboard
2. Settings → General → Node.js Version → 20.x
3. Deploy ulang dengan opsi "Clear cache and redeploy"

---

### 11.9 TypeScript error setelah update schema

**Penyebab:** tipe Drizzle belum ke-refresh.

**Solusi:**
```bash
rm -rf .next node_modules/.cache
pnpm dev
```

---

### 11.10 Rate limit kena saat testing

**Penyebab:** limit login 5/15 menit per IP.

**Solusi:**
- Tunggu 15 menit
- Atau reset Redis key: buka Upstash console → flush database (dev only)

---

## 12. Checklist Setup Selesai

Centang semua setelah setup:

- [ ] Node.js 20.x dan pnpm 9.x terinstall
- [ ] Repo di-clone dan `pnpm install` sukses
- [ ] Supabase project dibuat (region Singapore)
- [ ] Supabase Storage bucket `public` dibuat
- [ ] Supabase Realtime enabled untuk `attendances` & `attendance_sessions`
- [ ] Upstash Redis dibuat (region Singapore)
- [ ] `.env.local` terisi lengkap
- [ ] `pnpm drizzle-kit push` sukses (8 tabel ada di Supabase)
- [ ] `pnpm tsx scripts/seed.ts` sukses (1 admin + 1 event)
- [ ] `pnpm dev` jalan, halaman `http://localhost:3000` render
- [ ] Login admin berhasil
- [ ] (Opsional) Deploy ke Vercel sukses

---

## 13. Update & Maintenance

### 13.1 Update Dependencies

```bash
pnpm outdated           # cek yang ketinggalan
pnpm update             # update minor & patch
pnpm update --latest    # update major (hati-hati breaking change)
```

Setelah update, jalankan test:
```bash
pnpm typecheck && pnpm lint && pnpm build
```

### 13.2 Rotate `AUTH_SECRET`

Kalau ada indikasi leak:

1. Generate secret baru
2. Update di `.env.local` (dev) dan Vercel dashboard (prod)
3. Redeploy
4. **Semua admin harus login ulang**

### 13.3 Backup Database

Supabase free tier punya automatic backup 7 hari. Untuk backup manual:

```bash
pg_dump "postgresql://...pooler..." > backup-$(date +%Y%m%d).sql
```

Simpan di tempat aman (bukan git).

---

## 14. Referensi Cepat

| Butuh… | Lihat |
|---|---|
| Keputusan teknis | `ARCHITECTURE.md` |
| Skema DB | `SCHEMA.md` |
| Route | `ROUTES.md` |
| Aturan bisnis | `RULES.md` |
| Desain visual | `DESIGN.md` |
| Konten | `CONTENT.md` |
| Env vars | `.env.example` |
| Task selanjutnya | `TASK.md` |

---

## 15. Kontak Bantuan

Kalau stuck:
1. Cek section 11 (Troubleshooting) dulu
2. Cek log di terminal atau Vercel dashboard
3. Cek `TASK.md` section 6 (Pertanyaan Terbuka)
4. Tanya di grup developer (kalau ada)

---

**Versi:** 1.0
**Terakhir diperbarui:** [tanggal]
**Pemilik:** Tim NGABINTON