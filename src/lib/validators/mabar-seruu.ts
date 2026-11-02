/**
 * Validasi media "Mabar Seruu" (RULES.md §19).
 *
 * Video **tidak** ditranskode (tidak ada `ffmpeg` di stack): durasi dibatasi
 * di sisi klien (MediaRecorder 15 detik) dan diverifikasi ulang di sini.
 */
import { z } from "zod";

/** Foto mentah: maksimal 8MB sebelum dikompres `sharp`. */
export const MABAR_PHOTO_MAX_BYTES = 8 * 1024 * 1024;

/** Video: maksimal 25MB (≈15 detik 720p dari kamera ponsel). */
export const MABAR_VIDEO_MAX_BYTES = 25 * 1024 * 1024;

/** Poster (frame pembuka video): maksimal 4MB. */
export const MABAR_POSTER_MAX_BYTES = 4 * 1024 * 1024;

/** Batas durasi video — sesuai durasi rekam di klien. */
export const MABAR_VIDEO_MAX_SECONDS = 15;

export const MABAR_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const MABAR_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/3gpp",
  "video/ogg",
] as const;

/**
 * Ambil tipe MIME tanpa parameter (`video/webm;codecs=vp9` → `video/webm`).
 * `MediaRecorder` hampir selalu menambahkan `codecs=...`, jadi nilai mentahnya
 * tidak pernah cocok dengan daftar di atas.
 */
export function baseMimeType(value: string): string {
  return value.split(";")[0]?.trim().toLowerCase() ?? "";
}

/** Video apa pun tetap diterima (server tidak men-transcode); ini hanya pagar format. */
export function isAllowedVideoMimeType(value: string): boolean {
  const base = baseMimeType(value);
  return (
    (MABAR_VIDEO_MIME_TYPES as readonly string[]).includes(base) || base.startsWith("video/")
  );
}

/** Foto harus salah satu format yang bisa dikompres `<canvas>`. */
export function isAllowedPhotoMimeType(value: string): boolean {
  return (MABAR_PHOTO_MIME_TYPES as readonly string[]).includes(baseMimeType(value));
}

/** Angka opsional dari form/JSON — string kosong & null dianggap "tidak diisi". */
const optionalInt = (max: number) =>
  z.preprocess(
    (value) => (value === null || value === undefined || value === "" ? undefined : value),
    z.coerce.number().int().min(0).max(max).optional(),
  );

/** Metadata yang dikirim bersama file (multipart). */
export const mabarMetaSchema = z.object({
  sessionId: z
    .string()
    .uuid("Sesi tidak valid.")
    .nullish()
    .transform((value) => value ?? null),
  caption: z
    .string()
    .trim()
    .max(140, "Keterangan maksimal 140 karakter.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  durationSeconds: z.preprocess(
    (value) => (value === null || value === undefined || value === "" ? undefined : value),
    z.coerce
      .number()
      .int()
      .min(0)
      .max(MABAR_VIDEO_MAX_SECONDS, `Video maksimal ${MABAR_VIDEO_MAX_SECONDS} detik.`)
      .optional(),
  ).transform((value) => value ?? null),
  width: optionalInt(10000).transform((value) => value ?? null),
  height: optionalInt(10000).transform((value) => value ?? null),
});

/** Keputusan admin utama atas satu media. */
export const mediaReviewSchema = z.object({
  mediaId: z.string().uuid("Media tidak dikenal."),
  status: z.enum(["approved", "rejected"], { message: "Status tidak valid." }),
  note: z
    .string()
    .trim()
    .max(200, "Catatan maksimal 200 karakter.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
});
