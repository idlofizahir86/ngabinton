/**
 * Validasi form auth.
 * Referensi: `RULES.md` §4.5.
 */
import { z } from "zod";

/** Form login admin. */
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(50, "Username maksimal 50 karakter.")
    .regex(/^[a-z0-9_]+$/, "Username hanya boleh huruf kecil, angka, dan underscore."),
  // Password TIDAK di-trim (spasi bisa jadi bagian dari password).
  password: z.string().min(1, "Password wajib diisi.").max(200, "Password terlalu panjang."),
});

export type LoginInput = z.infer<typeof loginSchema>;
