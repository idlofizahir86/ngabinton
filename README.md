# NGABINTON

Website komunitas badminton mingguan **NGABINTON** (Bandung) — landing page ala Netflix,
halaman event travel, sistem presensi QR, dan admin dashboard.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · Drizzle + Postgres (Supabase)
· Auth JWT cookie (`jose` + `bcryptjs`) · Zod · Vercel.

## Menjalankan

```bash
pnpm install
cp .env.example .env.local   # isi env var (lihat SETUP.md)
pnpm dev
```

Buka http://localhost:3000

## Script

| Command | Fungsi |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Build production |
| `pnpm start` | Jalankan hasil build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Cek TypeScript |

## Dokumentasi

Sumber kebenaran project ada di file `.md` di root. **Baca berurutan sebelum ngoding:**

`AGENTS.md` → `ARCHITECTURE.md` → `SCHEMA.md` → `DESIGN.md` → `COMPONENTS.md` →
`ROUTES.md` → `RULES.md` → `CONTENT.md` → `TASK.md` → `SETUP.md` → `BRAND.md`

Panduan setup lengkap: `SETUP.md`. Daftar task: `TASK.md`.

