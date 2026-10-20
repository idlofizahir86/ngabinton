/**
 * Validasi input pencatatan permainan (RULES.md §13).
 * Payload game dikirim sebagai JSON di satu hidden field, lalu di-parse Zod.
 */
import { z } from "zod";

import { MAX_SETS_PER_MATCH, MAX_SET_SCORE } from "@/lib/constants";
import { optionalText, usernameField } from "@/lib/validators/common";

/** Peserta: anggota club (`userId`) atau BaturanNgabinton (`guestName`). */
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
      ctx.addIssue({ code: "custom", message: "Nama BaturanNgabinton minimal 2 karakter." });
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

/** Polling kehadiran sesi (RULES.md §14). */
export const rsvpSchema = z.object({
  sessionId: z.string().uuid("Sesi tidak valid."),
  choice: z.enum(["hadir", "skip"]),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

/** Kehadiran nyata sesi yang ditandai pengurus (RULES.md §14.2). */
export const sessionAttendanceSchema = z
  .object({
    sessionId: z.string().uuid("Sesi tidak valid."),
    userId: optionalText(20).refine((value) => value === null || /^\d+$/.test(value), {
      message: "Anggota tidak valid.",
    }),
    guestName: optionalText(40),
  })
  .superRefine((value, ctx) => {
    const hasUser = value.userId !== null;
    const hasGuest = value.guestName !== null;

    if (hasUser === hasGuest) {
      ctx.addIssue({
        code: "custom",
        message: "Pilih anggota atau isi nama BaturanNgabinton.",
        path: ["userId"],
      });
    }
    if (hasGuest && (value.guestName?.length ?? 0) < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Nama BaturanNgabinton minimal 2 karakter.",
        path: ["guestName"],
      });
    }
  });

export type SessionAttendanceInput = z.infer<typeof sessionAttendanceSchema>;

/** Konversi BaturanNgabinton menjadi anggota club. */
export const convertGuestSchema = z.object({
  guestName: z.string().trim().min(2, "Nama BaturanNgabinton tidak valid.").max(40),
  username: usernameField,
  displayName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(60),
  nickname: optionalText(40),
});

export type ConvertGuestInput = z.infer<typeof convertGuestSchema>;
