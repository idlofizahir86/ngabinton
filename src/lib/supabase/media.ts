/**
 * Penyimpanan media "Mabar Seruu" (instans) — SCHEMA.md §3.20.
 *
 * Memakai bucket `public` yang sudah ada (sama seperti avatar) dengan prefix
 * terpisah supaya tidak perlu membuat bucket baru. `SERVICE_ROLE_KEY` dipakai,
 * jadi modul ini **hanya** boleh diimpor dari server.
 */
import { AVATAR_BUCKET, publicObjectUrl } from "./server";

export const MEDIA_BUCKET = AVATAR_BUCKET;

/** Prefix folder di dalam bucket. */
export const MEDIA_PREFIX = "mabar-seruu";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export function mediaExtension(mimeType: string): string {
  return EXT_BY_MIME[mimeType] ?? "bin";
}

/** Path unik: `mabar-seruu/{photo|video|poster}/{userId}-{waktu}-{acak}.{ext}`. */
export function mediaObjectPath(
  kind: "photo" | "video" | "poster",
  userId: number,
  mimeType: string,
): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${mediaPathPrefix(kind, userId)}${Date.now()}-${suffix}.${mediaExtension(mimeType)}`;
}

/** Awalan path yang sah untuk satu user — dipakai memverifikasi kiriman klien. */
export function mediaPathPrefix(
  kind: "photo" | "video" | "poster",
  userId: number,
): string {
  return `${MEDIA_PREFIX}/${kind}/${userId}-`;
}

/** URL publik objek media (dipakai `<img>`/`<video>` & `next/image`). */
export function mediaPublicUrl(objectPath: string): string {
  return publicObjectUrl(objectPath);
}
