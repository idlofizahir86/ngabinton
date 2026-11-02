/**
 * POST /api/dokumentasi/mabar-seruu — catat media yang sudah diunggah browser
 * ke Supabase Storage (RULES.md §19).
 *
 * Body kecil (JSON metadata). Status selalu `pending` — tampil publik hanya
 * setelah admin utama menyetujui.
 */
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createSessionMedia } from "@/lib/api/session-media";
import { getCurrentUser } from "@/lib/auth/guards";
import { mediaPathPrefix } from "@/lib/supabase/media";
import { MABAR_VIDEO_MAX_SECONDS, mabarMetaSchema } from "@/lib/validators/mabar-seruu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

const createSchema = mabarMetaSchema.extend({
  kind: z.enum(["photo", "video"]),
  storagePath: z.string().min(1).max(300),
  posterPath: z.string().min(1).max(300).nullish(),
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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    console.error(
      "[mabar-seruu/create] validasi:",
      parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "),
    );
    return NextResponse.json(
      { ok: false, error: "Data momen tidak valid. Coba rekam ulang." },
      { status: 400, headers: NO_STORE },
    );
  }

  const { kind, storagePath, posterPath, sessionId, caption, durationSeconds, width, height } =
    parsed.data;

  // Path harus milik user ini — path ditandatangani server di `/sign`.
  if (!storagePath.startsWith(mediaPathPrefix(kind, user.id))) {
    return NextResponse.json(
      { ok: false, error: "Path media tidak valid." },
      { status: 400, headers: NO_STORE },
    );
  }
  if (posterPath && !posterPath.startsWith(mediaPathPrefix("poster", user.id))) {
    return NextResponse.json(
      { ok: false, error: "Path poster tidak valid." },
      { status: 400, headers: NO_STORE },
    );
  }
  if (kind === "video" && durationSeconds && durationSeconds > MABAR_VIDEO_MAX_SECONDS) {
    return NextResponse.json(
      { ok: false, error: `Video maksimal ${MABAR_VIDEO_MAX_SECONDS} detik.` },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    const id = await createSessionMedia({
      sessionId,
      uploaderUserId: user.id,
      kind,
      storagePath,
      posterPath: posterPath ?? null,
      caption,
      durationSeconds: kind === "video" ? durationSeconds : null,
      width: width ?? null,
      height: height ?? null,
    });

    // Media langsung tayang → segarkan halaman publik + panel admin.
    revalidatePath("/dokumentasi");
    revalidatePath("/dokumentasi/mabar-seruu");
    revalidatePath("/admin/media");
    return NextResponse.json({ ok: true, id, status: "approved" }, { headers: NO_STORE });
  } catch (err) {
    console.error("[mabar-seruu/create]", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan momen. Coba lagi." },
      { status: 500, headers: NO_STORE },
    );
  }
}
