import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL belum diset. Isi .env.local (lihat SETUP.md §5).");
}

/**
 * `prepare: false` diperlukan untuk Supabase **Transaction Pooler** (port 6543)
 * yang tidak mendukung prepared statements — lihat ARCHITECTURE.md ADR-004 & SETUP.md §3.3.
 *
 * Cast di bawah karena `globalThis` tidak punya tipe untuk cache koneksi kita.
 * Tujuan cache: mencegah pool koneksi baru dibuat tiap hot-reload saat `next dev`.
 */
const globalForDb = globalThis as unknown as {
  __ngabintonSql?: ReturnType<typeof postgres>;
};

/**
 * Batas pool per instance function. Supabase Transaction Pooler tetap jadi
 * multiplexer; nilai kecil mencegah satu instance membuka belasan koneksi
 * sekaligus (tiap koneksi baru = TCP + TLS + auth, dan itu penyebab request
 * pertama setelah instance dingin terasa lambat).
 */
const DB_POOL_MAX = 5;
/** Koneksi idle ditutup setelah 60 detik (hemat slot pooler, tetap hangat untuk burst). */
const DB_IDLE_TIMEOUT_SECONDS = 60;
/** Jangan menggantung 30 detik (default) saat pooler tidak merespons. */
const DB_CONNECT_TIMEOUT_SECONDS = 10;
/** Daur ulang koneksi tiap 15 menit supaya tidak memakai koneksi yang sudah diputus pooler. */
const DB_MAX_LIFETIME_SECONDS = 15 * 60;
/** TCP keepalive (detik) agar koneksi tidak mati diam-diam saat instance di-freeze Vercel. */
const DB_KEEP_ALIVE_SECONDS = 30;

const sql =
  globalForDb.__ngabintonSql ??
  postgres(connectionString, {
    prepare: false,
    max: DB_POOL_MAX,
    idle_timeout: DB_IDLE_TIMEOUT_SECONDS,
    connect_timeout: DB_CONNECT_TIMEOUT_SECONDS,
    max_lifetime: DB_MAX_LIFETIME_SECONDS,
    keep_alive: DB_KEEP_ALIVE_SECONDS,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__ngabintonSql = sql;
}

export const db = drizzle(sql, { schema });
