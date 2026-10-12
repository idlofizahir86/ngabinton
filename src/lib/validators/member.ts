/**
 * Validasi form anggota club.
 */
import { z } from "zod";

import { AVATAR_KEYS } from "@/lib/members/avatars";
import { normalizeWaNumber } from "@/lib/members/wa";

/** Nomor WhatsApp opsional; string kosong dianggap "tidak diisi". */
const waNumberField = z
  .string()
  .trim()
  .max(25, "Nomor WhatsApp terlalu panjang.")
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || normalizeWaNumber(value) !== null, {
    message: "Format nomor WhatsApp tidak valid (contoh: 081234567890).",
  })
  .transform((value) => (value === null ? null : normalizeWaNumber(value)));

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(60, "Nama maksimal 60 karakter."),
  nickname: z
    .string()
    .trim()
    .max(40, "Nama punggung maksimal 40 karakter.")
    .transform((value) => (value === "" ? null : value)),
  waNumber: waNumberField,
  avatarKey: z
    .string()
    .trim()
    .refine((value) => AVATAR_KEYS.includes(value), { message: "Avatar tidak dikenal." }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
