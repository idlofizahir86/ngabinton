/**
 * POST /api/dokumentasi/mabar-seruu/sign — buat URL unggah langsung ke
 * Supabase Storage (RULES.md §19).
 *
 * Kenapa signed URL: video bisa >4MB, sedangkan body request ke server
 * (Vercel) dibatasi ~4,5MB. File diunggah **langsung dari browser** ke storage,
 * server hanya menandatangani path (`mabar-seruu/{jenis}/{userId}-...`).
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/guards";
import { checkSessionMediaUploadRateLimit } from "@/lib/auth/rate-limit";
import { MEDIA_BUCKET, mediaObjectPath } from "@/lib/supabase/media";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { MABAR_PHOTO_MIME_TYPES, MABAR_VIDEO_MIME_TYPES } from "@/lib/validators/mabar-seruu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

const signSchema = z.object({
  kind: z.enum(["photo", "video"]),
  mimeType: z.string().min(3).max(100),
  withPoster: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Masuk dulu untuk mengunggah momen." },
      { status: 401, headers: NO_STORE },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = signSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak valid." },
      { status: 400, headers: NO_STORE },
    );
  }

  const { kind, mimeType, withPoster } = parsed.data;
  const allowed: readonly string[] =
    kind === "video" ? MABAR_VIDEO_MIME_TYPES : MABAR_PHOTO_MIME_TYPES;
  if (!allowed.includes(mimeType)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          kind === "video" ? "Format video tidak didukung." : "Format foto tidak didukung.",
      },
      { status: 400, headers: NO_STORE },
    );
  }

  const rate = await checkSessionMediaUploadRateLimit(user.id);
  if (!rate.success) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak unggahan. Coba lagi beberapa menit lagi." },
      { status: 429, headers: NO_STORE },
    );
  }

  const targets: { target: "media" | "poster"; path: string }[] = [
    { target: "media", path: mediaObjectPath(kind, user.id, mimeType) },
  ];
  if (kind === "video" && withPoster) {
    targets.push({ target: "poster", path: mediaObjectPath("poster", user.id, "image/webp") });
  }

  const supabase = getSupabaseAdmin();
  const uploads: { target: "media" | "poster"; path: string; signedUrl: string }[] = [];
  for (const item of targets) {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUploadUrl(item.path);
    if (error || !data) {
      console.error("[mabar-seruu/sign]", error?.message ?? "signed url kosong");
      return NextResponse.json(
        { ok: false, error: "Gagal menyiapkan unggahan. Coba lagi." },
        { status: 500, headers: NO_STORE },
      );
    }
    uploads.push({ target: item.target, path: item.path, signedUrl: data.signedUrl });
  }

  return NextResponse.json({ ok: true, uploads }, { headers: NO_STORE });
}
