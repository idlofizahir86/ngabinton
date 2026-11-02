"use server";

/**
 * Moderasi media "Mabar Seruu" — hanya admin utama (RULES.md §19).
 * Media `pending` tayang di publik hanya setelah disetujui di sini.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { deleteSessionMedia, reviewSessionMedia } from "@/lib/api/session-media";
import { requireAdmin } from "@/lib/auth/guards";
import { MEDIA_BUCKET } from "@/lib/supabase/media";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { mediaReviewSchema } from "@/lib/validators/mabar-seruu";

const mediaIdSchema = z.string().uuid();

function revalidateMediaViews() {
  revalidatePath("/admin/media");
  revalidatePath("/dokumentasi/mabar-seruu");
  revalidatePath("/dokumentasi");
}

/** Setujui / tolak satu media. */
export async function reviewSessionMediaAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();

  const parsed = mediaReviewSchema.safeParse({
    mediaId: formData.get("mediaId") ?? "",
    status: formData.get("status") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return;

  const reviewerUserId = Number(session.sub);
  if (!Number.isInteger(reviewerUserId)) return;

  await reviewSessionMedia({
    mediaId: parsed.data.mediaId,
    status: parsed.data.status,
    reviewerUserId,
    note: parsed.data.note,
  });

  revalidateMediaViews();
}

/** Hapus media beserta objeknya di Supabase Storage. */
export async function deleteSessionMediaAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = mediaIdSchema.safeParse(formData.get("mediaId"));
  if (!parsed.success) return;

  const removed = await deleteSessionMedia(parsed.data);
  if (!removed) return;

  const paths = [removed.storagePath, removed.posterPath].filter(
    (path): path is string => Boolean(path),
  );
  if (paths.length > 0) {
    await getSupabaseAdmin().storage.from(MEDIA_BUCKET).remove(paths);
  }

  revalidateMediaViews();
}
