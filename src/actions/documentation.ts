"use server";

/**
 * Upload foto Arsip Dokumentasi ke Google Drive.
 * Wajib login anggota. Foto dikompres ulang di server (`sharp`) sebelum
 * dikirim, sekaligus membuang EXIF/GPS.
 */
import { revalidatePath, revalidateTag } from "next/cache";
import sharp from "sharp";

import { requireUser } from "@/lib/auth/guards";
import { checkDocumentationUploadRateLimit } from "@/lib/auth/rate-limit";
import type { DocumentationUploadState } from "@/lib/forms/states";
import { uploadDocumentationPhoto } from "@/lib/google/drive";
import {
  DOCUMENTATION_MAX_BYTES,
  DOCUMENTATION_MIME_TYPES,
  documentationUploadSchema,
} from "@/lib/validators/documentation";

function isAllowedType(type: string): boolean {
  return (DOCUMENTATION_MIME_TYPES as readonly string[]).includes(type);
}

export async function uploadDocumentationAction(
  _prev: DocumentationUploadState,
  formData: FormData,
): Promise<DocumentationUploadState> {
  const invalid: DocumentationUploadState = {
    error: null,
    ok: false,
    fileName: null,
    webViewLink: null,
  };

  const session = await requireUser();
  const userId = Number(session.sub);
  if (!Number.isInteger(userId)) {
    return { ...invalid, error: "Sesi tidak valid. Coba login ulang." };
  }

  const parsed = documentationUploadSchema.safeParse({
    title: formData.get("title") ?? "",
    date: formData.get("date") ?? "",
  });
  if (!parsed.success) {
    return { ...invalid, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ...invalid, error: "Pilih file foto dulu." };
  }
  if (file.size > DOCUMENTATION_MAX_BYTES) {
    return { ...invalid, error: "Foto terlalu besar setelah dikompres. Coba file lain." };
  }
  if (!isAllowedType(file.type)) {
    return { ...invalid, error: "Format harus JPG, PNG, atau WebP." };
  }

  const limit = await checkDocumentationUploadRateLimit(userId);
  if (!limit.success) {
    return { ...invalid, error: "Terlalu banyak upload. Coba lagi beberapa menit lagi." };
  }

  let processed: Buffer;
  try {
    processed = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { ...invalid, error: "Foto tidak bisa diproses. Coba file lain." };
  }

  try {
    const uploaded = await uploadDocumentationPhoto(processed, {
      title: parsed.data.title,
      date: parsed.data.date || null,
      uploadedBy: session.username,
    });

    revalidatePath("/dokumentasi");
    revalidateTag("documentation", "max");

    return {
      error: null,
      ok: true,
      fileName: uploaded.name,
      webViewLink: uploaded.webViewLink,
    };
  } catch (err) {
    // Jangan teruskan pesan gaxios mentah (bisa memuat detail internal/token).
    console.error(
      "[uploadDocumentationAction]",
      err instanceof Error ? err.message : String(err),
    );
    return {
      ...invalid,
      error: "Gagal mengunggah ke Google Drive. Coba lagi sebentar.",
    };
  }
}
