/**
 * Validasi input pencatatan permainan (RULES.md §13).
 * Payload game dikirim sebagai JSON di satu hidden field, lalu di-parse Zod.
 */
import { z } from "zod";

import { MAX_SETS_PER_MATCH, MAX_SET_SCORE } from "@/lib/constants";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .optional()
    .transform((value) => value ?? null);

/** Peserta: anggota club (`userId`) atau tamu (`guestName`). */
export const matchParticipantSchema = z
  .object({
    kind: z.enum(["member", "guest"]),
    userId: z.coerce.number().int().positive().nullable().optional(),
    guestName: z.string().trim().max(40).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === "member" && !value.userId) {
      ctx.addIssue({ code: "custom", message: "Pilih anggota club." });
    }
    if (value.kind === "guest" && (!value.guestName || value.guestName.trim().length < 2)) {
      ctx.addIssue({ code: "custom", message: "Nama tamu minimal 2 karakter." });
    }
  });

/** Satu set: skor kedua sisi, wajib ada pemenang. */
export const matchSetSchema = z
  .object({
    scoreA: z.coerce
      .number()
      .int("Skor harus bilangan bulat.")
      .min(0, "Skor tidak boleh negatif.")
      .max(MAX_SET_SCORE, `Skor maksimal ${MAX_SET_SCORE}.`),
    scoreB: z.coerce
      .number()
      .int("Skor harus bilangan bulat.")
      .min(0, "Skor tidak boleh negatif.")
      .max(MAX_SET_SCORE, `Skor maksimal ${MAX_SET_SCORE}.`),
  })
  .refine((set) => set.scoreA !== set.scoreB, {
    message: "Set harus punya pemenang (skor tidak boleh seri).",
  });

export const recordMatchSchema = z.object({
  sessionId: z.string().uuid("Sesi tidak valid."),
  label: optionalText(60),
  notes: optionalText(200),
  sideA: z.array(matchParticipantSchema).min(1, "Tim A minimal 1 pemain.").max(6),
  sideB: z.array(matchParticipantSchema).min(1, "Tim B minimal 1 pemain.").max(6),
  sets: z
    .array(matchSetSchema)
    .min(1, "Minimal 1 set.")
    .max(MAX_SETS_PER_MATCH, `Maksimal ${MAX_SETS_PER_MATCH} set.`),
});

export type RecordMatchInput = z.infer<typeof recordMatchSchema>;

/** Sesi bermain baru. */
export const playSessionSchema = z.object({
  title: z.string().trim().min(3, "Judul sesi minimal 3 karakter.").max(80),
  location: optionalText(80),
  playedAt: z.string().trim().min(1, "Tanggal & jam mulai wajib diisi."),
  endedAt: optionalText(40),
  notes: optionalText(200),
});

export type PlaySessionInput = z.infer<typeof playSessionSchema>;

/** Konversi tamu (baturan) menjadi anggota club. */
export const convertGuestSchema = z.object({
  guestName: z.string().trim().min(2, "Nama tamu tidak valid.").max(40),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(50, "Username maksimal 50 karakter.")
    .regex(/^[a-z0-9_]+$/, "Username hanya boleh huruf kecil, angka, dan underscore."),
  displayName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(60),
  nickname: optionalText(40),
});

export type ConvertGuestInput = z.infer<typeof convertGuestSchema>;
