"use server";

/**
 * Server Actions avatar anggota (RULES.md §6.2):
 * upload foto → resize + convert WebP (`sharp`) → simpan ke Supabase Storage → update `users.avatar_url`.
 */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import type { AvatarState } from "@/lib/forms/states";
import {
  AVATAR_BUCKET,
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  AVATAR_SIZE,
  avatarObjectPath,
  avatarPublicUrl,
  getSupabaseAdmin,
  objectPathFromUrl,
} from "@/lib/supabase/server";

function isAllowedType(type: string): boolean {
  return (AVATAR_MIME_TYPES as readonly string[]).includes(type);
}

function revalidateAvatar() {
  revalidatePath("/member");
  revalidatePath("/member/profil");
  revalidatePath("/leaderboard");
  revalidatePath("/admin/anggota");
}

/** Upload foto avatar (JPG/PNG/WebP, maks 5MB). */
export async function uploadAvatarAction(
  _prev: AvatarState,
  formData: FormData,
): Promise<AvatarState> {
  const session = await requireUser();
  const userId = Number(session.sub);
  if (!Number.isInteger(userId)) {
    return { error: "Sesi tidak valid. Coba login ulang.", ok: false };
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Pilih file foto dulu.", ok: false };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { error: "Ukuran foto maksimal 5MB.", ok: false };
  }
  if (!isAllowedType(file.type)) {
    return { error: "Format harus JPG, PNG, atau WebP.", ok: false };
  }

  let processed: Buffer;
  try {
    processed = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { error: "Foto tidak bisa diproses. Coba file lain.", ok: false };
  }

  const objectPath = avatarObjectPath(userId);
  const { error: uploadError } = await getSupabaseAdmin()
    .storage.from(AVATAR_BUCKET)
    .upload(objectPath, processed, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "31536000",
    });
  if (uploadError) {
    return { error: "Gagal mengunggah foto. Coba lagi sebentar.", ok: false };
  }

  await db
    .update(users)
    .set({ avatarUrl: avatarPublicUrl(objectPath), updatedAt: new Date() })
    .where(eq(users.id, userId));

  revalidateAvatar();
  return { error: null, ok: true };
}

/** Hapus foto avatar → kembali ke preset. */
export async function removeAvatarAction(): Promise<void> {
  const session = await requireUser();
  const userId = Number(session.sub);
  if (!Number.isInteger(userId)) return;

  const rows = await db
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const current = rows[0]?.avatarUrl;
  const objectPath = current ? objectPathFromUrl(current) : null;
  if (objectPath) {
    await getSupabaseAdmin().storage.from(AVATAR_BUCKET).remove([objectPath]);
  }

  await db
    .update(users)
    .set({ avatarUrl: null, updatedAt: new Date() })
    .where(eq(users.id, userId));

  revalidateAvatar();
}
