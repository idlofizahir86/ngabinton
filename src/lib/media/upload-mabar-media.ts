/**
 * Kirim media Mabar Seruu: minta signed URL → unggah langsung ke Supabase
 * Storage → catat metadata di server (RULES.md §19).
 * Client-only; dipakai `<MabarUploadForm />`.
 */
import type { MediaDraft } from "@/lib/media/use-media-draft";

type SignResponse = {
  ok?: boolean;
  error?: string;
  uploads?: { target: "media" | "poster"; path: string; signedUrl: string }[];
};

export type UploadMabarInput = {
  draft: MediaDraft;
  sessionId: string;
  caption: string;
};

export async function uploadMabarMedia({
  draft,
  sessionId,
  caption,
}: UploadMabarInput): Promise<void> {
  const signResponse = await fetch("/api/dokumentasi/mabar-seruu/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind: draft.kind,
      mimeType: draft.mimeType,
      withPoster: Boolean(draft.posterBlob),
    }),
  });
  const sign = (await signResponse.json()) as SignResponse;
  const mediaTarget = sign.uploads?.find((item) => item.target === "media");
  const posterTarget = sign.uploads?.find((item) => item.target === "poster");
  if (!signResponse.ok || !sign.ok || !mediaTarget) {
    throw new Error(sign.error ?? "Gagal menyiapkan unggahan.");
  }

  const put = async (url: string, blob: Blob, contentType: string) => {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "content-type": contentType, "x-upsert": "false" },
      body: blob,
    });
    if (!response.ok) throw new Error("Gagal mengunggah file ke penyimpanan.");
  };

  await put(mediaTarget.signedUrl, draft.blob, draft.mimeType);
  if (posterTarget && draft.posterBlob) {
    await put(posterTarget.signedUrl, draft.posterBlob, "image/webp");
  }

  const saveResponse = await fetch("/api/dokumentasi/mabar-seruu", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind: draft.kind,
      storagePath: mediaTarget.path,
      posterPath: posterTarget?.path ?? null,
      sessionId: sessionId || null,
      caption,
      durationSeconds: draft.durationSeconds,
      width: draft.width || null,
      height: draft.height || null,
    }),
  });
  const saved = (await saveResponse.json()) as { ok?: boolean; error?: string };
  if (!saveResponse.ok || !saved.ok) {
    throw new Error(saved.error ?? "Gagal menyimpan momen.");
  }
}
