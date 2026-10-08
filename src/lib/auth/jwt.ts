/**
 * Session JWT (HS256) untuk auth admin.
 * Referensi: `RULES.md` §1.2 (session & payload), `ARCHITECTURE.md` ADR-002.
 *
 * Modul ini **edge-compatible** (hanya `jose` + Web API) supaya bisa dipakai
 * di `middleware.ts` tanpa menarik dependency Node.
 */
import { SignJWT, jwtVerify } from "jose";

/** Durasi session: 7 hari (`RULES.md` §1.2). */
const SESSION_DURATION = "7d";

export type SessionRole = "admin" | "superadmin";

/** Payload session yang kita simpan di dalam JWT. */
export type SessionPayload = {
  /** user id */
  sub: string;
  username: string;
  role: SessionRole;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET belum diset. Isi .env.local (lihat SETUP.md §5).");
  }
  return new TextEncoder().encode(secret);
}

/** Buat JWT session. `exp` dihitung otomatis dari `iat` + 7 hari. */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ username: payload.username, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
}

/**
 * Verifikasi JWT session.
 * @returns payload kalau valid, atau `null` kalau invalid/expired/salah bentuk.
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const username = payload.username;
    const role = payload.role;

    if (typeof sub !== "string" || typeof username !== "string") {
      return null;
    }
    if (role !== "admin" && role !== "superadmin") {
      return null;
    }

    return { sub, username, role };
  } catch {
    return null;
  }
}
