/**
 * Query baca untuk tabel `users`.
 * Semua akses DB untuk BACA lewat `lib/api/` (ARCHITECTURE.md §2 aturan folder 4).
 */
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

/** User untuk keperluan auth (mengandung `passwordHash`). JANGAN kirim ke client. */
export type AuthUser = {
  id: number;
  username: string;
  displayName: string;
  role: "admin" | "superadmin";
  isActive: boolean;
  passwordHash: string;
};

/** Ambil user berdasarkan username. `null` kalau tidak ada. */
export async function getUserByUsername(username: string): Promise<AuthUser | null> {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      isActive: users.isActive,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return rows[0] ?? null;
}
