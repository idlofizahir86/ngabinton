/**
 * Supabase Storage (server-only) untuk upload avatar anggota.
 * Bucket `public` sudah dibuat (TASK.md M0-02) — tidak perlu layanan storage lain.
 * Memakai `SERVICE_ROLE_KEY` → **jangan** diimpor dari Client Component.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Bucket publik yang sudah ada. */
export const AVATAR_BUCKET = "public";

/** Prefix folder di dalam bucket. */
export const AVATAR_PREFIX = "avatars";

/** Batas ukuran file mentah (RULES.md §6.2: maks 5MB sebelum convert). */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/** Sisi avatar hasil resize (persegi, 1:1). */
export const AVATAR_SIZE = 256;

/** Tipe file yang diterima. */
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

let cached: SupabaseClient | null = null;

/** Klien admin (service role). Cache agar tidak re-init tiap panggilan. */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diset (SETUP.md §5).");
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** Path objek unik per user (timestamp → cache-busting). */
export function avatarObjectPath(userId: number): string {
  return `${AVATAR_PREFIX}/${userId}-${Date.now()}.webp`;
}

/** URL publik objek di bucket `public`. */
export function avatarPublicUrl(objectPath: string): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/${objectPath}`;
}

/** Ambil kembali `objectPath` dari URL publik (untuk hapus). `null` kalau tidak cocok. */
export function objectPathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const index = url.indexOf(marker);
  return index >= 0 ? url.slice(index + marker.length) : null;
}
