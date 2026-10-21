/** Validasi upload foto dokumentasi (Arsip Dokumentasi). */
import { z } from "zod";

/** Batas file setelah kompresi client — Vercel menolak body > 4.5MB. */
export const DOCUMENTATION_MAX_BYTES = 4 * 1024 * 1024;

export const DOCUMENTATION_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const documentationUploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter.")
    .max(120, "Judul maksimal 120 karakter."),
  /** Kosong → pakai tanggal file dibuat. */
  date: z
    .string()
    .trim()
    .refine((value) => value === "" || ISO_DATE.test(value), "Tanggal tidak valid."),
});

export type DocumentationUploadInput = z.infer<typeof documentationUploadSchema>;
