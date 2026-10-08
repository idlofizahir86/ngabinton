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

const sql = globalForDb.__ngabintonSql ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__ngabintonSql = sql;
}

export const db = drizzle(sql, { schema });
