/**
 * Validasi form auth.
 * Referensi: `RULES.md` §1.1 (login pakai username **atau** nomor WhatsApp).
 */
import { z } from "zod";

/** Form login — `identifier` boleh username atau nomor WhatsApp. */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Minimal 3 karakter.")
    .max(50, "Maksimal 50 karakter."),
  // Password TIDAK di-trim (spasi bisa jadi bagian dari password).
  password: z.string().min(1, "Password wajib diisi.").max(200, "Password terlalu panjang."),
});

export type LoginInput = z.infer<typeof loginSchema>;
