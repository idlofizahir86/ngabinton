/**
 * Field validasi yang dipakai bersama oleh beberapa form.
 */
import { z } from "zod";

/** Teks opsional; string kosong / `null` dianggap "tidak diisi". */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value === null || value === undefined || value === "" ? null : value));

/** Username anggota: huruf kecil, angka, underscore. */
export const usernameField = z
  .string()
  .trim()
  .min(3, "Username minimal 3 karakter.")
  .max(50, "Username maksimal 50 karakter.")
  .regex(/^[a-z0-9_]+$/, "Username hanya boleh huruf kecil, angka, dan underscore.");

/** Pola email sederhana — cukup untuk validasi form (bukan verifikasi kirim). */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email opsional; string kosong dianggap "tidak diisi", disimpan huruf kecil. */
export const emailField = z
  .string()
  .trim()
  .max(120, "Email maksimal 120 karakter.")
  .transform((value) => (value === "" ? null : value.toLowerCase()))
  .refine((value) => value === null || EMAIL_PATTERN.test(value), {
    message: "Format email tidak valid (contoh: nama@email.com).",
  });
