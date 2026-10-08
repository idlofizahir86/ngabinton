import { existsSync } from "node:fs";
import { resolve } from "node:path";

import type { Config } from "drizzle-kit";

// Drizzle Kit tidak otomatis membaca `.env.local` (hanya `.env`), jadi kita muat manual.
for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) process.loadEnvFile(path);
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL belum diset. Isi .env.local (lihat SETUP.md §5).");
}

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  verbose: true,
  strict: true,
} satisfies Config;
