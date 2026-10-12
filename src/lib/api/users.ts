/**
 * Query baca untuk tabel `users` — admin, pengurus, dan anggota club.
 * Semua akses DB untuk BACA lewat `lib/api/` (ARCHITECTURE.md §2 aturan folder 4).
 */
import { eq, or } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { looksLikePhone, normalizeWaNumber } from "@/lib/members/wa";
import type { PublicMember, SessionUser } from "@/lib/types/member";

export type UserRole = "admin" | "superadmin" | "member";

/** User untuk keperluan auth (mengandung `passwordHash`). JANGAN kirim ke client. */
export type AuthUser = {
  id: number;
  username: string;
  displayName: string;
  nickname: string | null;
  avatarKey: string | null;
  role: UserRole;
  isActive: boolean;
  passwordHash: string;
};

const AUTH_COLUMNS = {
  id: users.id,
  username: users.username,
  displayName: users.displayName,
  nickname: users.nickname,
  avatarKey: users.avatarKey,
  role: users.role,
  isActive: users.isActive,
  passwordHash: users.passwordHash,
} as const;

/** Ambil user berdasarkan username. `null` kalau tidak ada. */
export async function getUserByUsername(username: string): Promise<AuthUser | null> {
  const rows = await db.select(AUTH_COLUMNS).from(users).where(eq(users.username, username)).limit(1);
  return rows[0] ?? null;
}

/**
 * Ambil user berdasarkan **username atau nomor WhatsApp** (RULES.md §1.1).
 * Nomor dinormalisasi (`08xx` → `628xx`) sebelum dibandingkan.
 */
export async function getUserByIdentifier(identifier: string): Promise<AuthUser | null> {
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  const normalizedWa = looksLikePhone(trimmed) ? normalizeWaNumber(trimmed) : null;

  const condition = normalizedWa
    ? or(eq(users.username, trimmed), eq(users.waNumber, normalizedWa))
    : eq(users.username, trimmed);

  const rows = await db.select(AUTH_COLUMNS).from(users).where(condition).limit(1);
  return rows[0] ?? null;
}

/** Profil ringkas (tanpa `passwordHash`) untuk keperluan tampilan. */
export async function getUserProfile(id: number): Promise<PublicMember | null> {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      nickname: users.nickname,
      waNumber: users.waNumber,
      email: users.email,
      avatarKey: users.avatarKey,
      avatarUrl: users.avatarUrl,
      exp: users.exp,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return rows[0] ?? null;
}

/** Profil ringkas untuk keperluan sesi (area member/admin). */
export async function getSessionUser(id: number): Promise<SessionUser | null> {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      nickname: users.nickname,
      avatarKey: users.avatarKey,
      avatarUrl: users.avatarUrl,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return rows[0] ?? null;
}
