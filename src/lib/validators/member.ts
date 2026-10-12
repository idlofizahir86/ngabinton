/**
 * Validasi form anggota club.
 */
import { z } from "zod";

import { AVATAR_KEYS } from "@/lib/members/avatars";
import { normalizeWaNumber } from "@/lib/members/wa";
import { emailField, optionalText, usernameField } from "@/lib/validators/common";

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

const displayNameField = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter.")
  .max(60, "Nama maksimal 60 karakter.");

const nicknameField = optionalText(40);

const avatarKeyField = z
  .string()
  .trim()
  .refine((value) => AVATAR_KEYS.includes(value), { message: "Avatar tidak dikenal." });

export const updateProfileSchema = z.object({
  displayName: displayNameField,
  nickname: nicknameField,
  waNumber: waNumberField,
  email: emailField,
  avatarKey: avatarKeyField,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Form admin: tambah anggota club baru. */
export const createMemberSchema = z.object({
  username: usernameField,
  displayName: displayNameField,
  nickname: nicknameField,
  waNumber: waNumberField,
  email: emailField,
  avatarKey: avatarKeyField,
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

/** Form admin: edit data anggota (termasuk status aktif). */
export const updateMemberSchema = z.object({
  displayName: displayNameField,
  nickname: nicknameField,
  waNumber: waNumberField,
  email: emailField,
  avatarKey: avatarKeyField,
  isActive: z
    .string()
    .optional()
    .transform((value) => value === "on" || value === "true"),
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
