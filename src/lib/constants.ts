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

// ------------------------------------------------------------
// Skor & EXP permainan (RULES.md §13)
// ------------------------------------------------------------

/** EXP untuk setiap set yang dimenangkan. */
export const EXP_WIN_PER_SET = 5;

/** EXP untuk setiap set yang kalah (tetap dapat EXP saat hadir & main). */
export const EXP_LOSS_PER_SET = 2;

/** Skor maksimum satu set (rally point, contoh: 42). */
export const MAX_SET_SCORE = 42;

/** Jumlah set maksimum dalam satu game. */
export const MAX_SETS_PER_MATCH = 5;

/** Sisi tim dalam satu game. */
export const MATCH_SIDES = ["a", "b"] as const;
export type MatchSide = (typeof MATCH_SIDES)[number];

/** Suffix password default anggota club: `{username}ngabinton` (`TASK.md`). */
export const MEMBER_PASSWORD_SUFFIX = "ngabinton";

// ------------------------------------------------------------
// Polling kehadiran sesi (RULES.md §14)
// ------------------------------------------------------------

/** Pilihan RSVP. */
export const RSVP_CHOICES = ["hadir", "skip"] as const;
export type RsvpChoice = (typeof RSVP_CHOICES)[number];

/** Label tampil tiap pilihan. */
export const RSVP_LABELS: Record<RsvpChoice, string> = {
  hadir: "Gass 🔥",
  skip: "Ga dulu 🥱",
};
