/**
 * Konstanta aplikasi yang **edge-safe** (tanpa dependency Node),
 * supaya bisa dipakai di `middleware.ts` maupun server biasa.
 */

/** Nama cookie session (`RULES.md` §1.2). */
export const SESSION_COOKIE_NAME = "session";

/** Durasi session: 7 hari dalam detik (`RULES.md` §1.2). */
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
