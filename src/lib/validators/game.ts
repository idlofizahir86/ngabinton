/** Validasi input API mini-game (Zod) — ROUTES.md §1.3. */
import { z } from "zod";

/** Pong tidak lewat endpoint ini (peringkatnya dari hasil tanding). */
export const gameScoreSchema = z.object({
  game: z.enum(["flappy-badminton", "pelari-kalcer", "pukul-aku-pukul-aku"]),
  score: z.number().int().min(0).max(1_000_000),
});

export const pongResultSchema = z.object({
  code: z.string().trim().min(4).max(12).regex(/^[A-Z0-9]+$/),
  hostScore: z.number().int().min(0).max(99),
  guestScore: z.number().int().min(0).max(99),
});

export const pongJoinSchema = z.object({
  action: z.literal("join"),
});

export const pongSignalSchema = z
  .object({
    offer: z.string().min(10).max(20_000).optional(),
    answer: z.string().min(10).max(20_000).optional(),
    /** Host meminta answer lama dibuang (negosiasi baru). */
    reset: z.boolean().optional(),
  })
  .refine((value) => (value.offer ? 1 : 0) + (value.answer ? 1 : 0) === 1, {
    message: "Kirim salah satu: offer atau answer.",
  });
