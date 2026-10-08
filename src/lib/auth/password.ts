/**
 * Password hashing untuk auth admin.
 * Referensi: `RULES.md` §1.4 (bcryptjs, cost factor 10).
 *
 * Catatan: modul ini memakai `bcryptjs` (Node) → **bukan** edge-compatible.
 * Hanya dipakai di Server Action/Route Handler, jangan di `middleware.ts`.
 */
import bcrypt from "bcryptjs";

/** Cost factor bcrypt (`RULES.md` §1.4). Jangan diturunkan. */
const BCRYPT_COST = 10;

/** Hash password plaintext → string bcrypt. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/** Bandingkan password plaintext dengan hash tersimpan. */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
