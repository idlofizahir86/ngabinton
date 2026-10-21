/**
 * Proxy gambar dokumentasi dari Google Drive.
 *
 * Foto disimpan privat di Drive; endpoint ini yang menyajikannya ke publik
 * tanpa membocorkan access/refresh token. Hanya file yang ada di listing
 * folder dokumentasi yang boleh diakses.
 */
import { Readable } from "node:stream";

import {
  getDocumentationPhotoMedia,
  getDocumentationPhotos,
} from "@/lib/google/drive";

export const runtime = "nodejs";

/** ID Drive: URL-safe base64-ish. */
const FILE_ID_PATTERN = /^[A-Za-z0-9_-]{10,200}$/;

const IMMUTABLE_CACHE = "public, max-age=31536000, s-maxage=31536000, immutable";

function notFound(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  if (!FILE_ID_PATTERN.test(fileId)) {
    return notFound();
  }

  // Allowlist dari listing folder — mencegah proxy dipakai untuk file Drive lain.
  const photos = await getDocumentationPhotos();
  if (!photos.some((photo) => photo.id === fileId)) {
    return notFound();
  }

  try {
    const media = await getDocumentationPhotoMedia(fileId);
    return new Response(Readable.toWeb(media.stream) as unknown as BodyInit, {
      headers: {
        "Content-Type": media.mimeType,
        "Content-Disposition": "inline",
        "Cache-Control": IMMUTABLE_CACHE,
      },
    });
  } catch (err) {
    console.error(
      "[api:dokumentasi] gagal mengambil file:",
      err instanceof Error ? err.message : String(err),
    );
    return new Response("Bad gateway", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
