/**
 * Cookie session admin (JWT di cookie).
 * Referensi: `RULES.md` §1.2 (nama cookie, flag, durasi 7 hari).
 *
 * `getSession` aman dipanggil di Server Component / Server Action / Route Handler.
 * `setSessionCookie` & `clearSessionCookie` hanya boleh di Server Action / Route Handler.
 * Modul ini Node/server-only (pakai `next/headers`), jangan di `middleware.ts`.
 */
import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/constants";

import { verifySession, type SessionPayload } from "./jwt";

/** Opsi cookie yang dipakai untuk set & clear. */
function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

/** Baca & verifikasi session dari cookie. `null` kalau tidak ada / invalid / expired. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySession(token);
}

/** Simpan token session ke cookie (HttpOnly, SameSite=Lax, Secure di production). */
export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/** Hapus cookie session. */
export async function clearSessionCookie(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
}
