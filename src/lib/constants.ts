/**
 * Konstanta aplikasi yang **edge-safe** (tanpa dependency Node),
 * supaya bisa dipakai di `middleware.ts` maupun server biasa.
 */

/** Nama cookie session (`RULES.md` §1.2). */
export const SESSION_COOKIE_NAME = "session";

/** Durasi session: 7 hari dalam detik (`RULES.md` §1.2). */
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

/**
 * URL publik aplikasi (`.env.example` §APP, `NEXT_PUBLIC_APP_URL`).
 * Dipakai untuk metadata/OG, URL QR, dan redirect. `null` bila belum diisi.
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? null;
