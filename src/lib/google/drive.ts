/**
 * Akses Google Drive untuk Arsip Dokumentasi (server-only).
 *
 * Metadata:
 * - Judul  → `description` file (tampil juga di UI Drive, tanpa batas byte).
 * - Tanggal/uploader → `appProperties` (nilai dibatasi 124 byte, jangan taruh
 *   judul panjang di sini).
 */
import "server-only";

import { Readable } from "node:stream";

import { unstable_cache } from "next/cache";
import { google, type drive_v3 } from "googleapis";

import { getOAuthClient } from "./auth";

/** Folder Drive tujuan; `GOOGLE_DRIVE_FOLDER_ID` lebih spesifik daripada `FOLDER_ID`. */
export function getDocumentationFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID ?? process.env.FOLDER_ID;
  if (!id) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID / FOLDER_ID belum diset (lihat .env.example).");
  }
  return id;
}

const globalForDrive = globalThis as unknown as {
  __ngabintonDrive?: drive_v3.Drive;
};

export async function getDrive(): Promise<drive_v3.Drive> {
  if (globalForDrive.__ngabintonDrive) {
    return globalForDrive.__ngabintonDrive;
  }
  const auth = await getOAuthClient();
  const drive = google.drive({ version: "v3", auth });
  globalForDrive.__ngabintonDrive = drive;
  return drive;
}

export type DocumentationPhoto = {
  id: string;
  title: string;
  /** `YYYY-MM-DD` (tanggal kegiatan) atau tanggal file dibuat. */
  date: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
};

const FILE_FIELDS =
  "nextPageToken, files(id,name,description,createdTime,mimeType,imageMediaMetadata(width,height),appProperties)";

function toPhoto(file: drive_v3.Schema$File): DocumentationPhoto | null {
  if (!file.id) return null;
  const title = file.description?.trim() || file.name?.trim() || "Tanpa judul";
  const activityDate = file.appProperties?.date ?? null;
  const created = file.createdTime ? file.createdTime.slice(0, 10) : null;

  return {
    id: file.id,
    title,
    date: activityDate ?? created,
    mimeType: file.mimeType ?? "image/webp",
    width: file.imageMediaMetadata?.width ?? null,
    height: file.imageMediaMetadata?.height ?? null,
  };
}

/**
 * Semua foto di folder dokumentasi, terbaru dulu.
 * Error (token belum ada, `invalid_grant`, Drive down) → `[]` supaya
 * build/prerender halaman publik tidak ikut gagal.
 */
export async function listDocumentationPhotos(): Promise<DocumentationPhoto[]> {
  try {
    const drive = await getDrive();
    const folderId = getDocumentationFolderId();
    const photos: DocumentationPhoto[] = [];
    let pageToken: string | undefined;

    do {
      const res = await drive.files.list({
        q: `'${folderId.replace(/'/g, "\\'")}' in parents and trashed = false and mimeType contains 'image/'`,
        fields: FILE_FIELDS,
        orderBy: "createdTime desc",
        pageSize: 1000,
        pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      for (const file of res.data.files ?? []) {
        const photo = toPhoto(file);
        if (photo) photos.push(photo);
      }
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    return photos;
  } catch (err) {
    console.error(
      "[drive] gagal membaca folder dokumentasi:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

/** Listing di-cache 5 menit; upload memanggil `revalidateTag("documentation", "max")`. */
export const getDocumentationPhotos = unstable_cache(
  listDocumentationPhotos,
  ["documentation-photos"],
  { revalidate: 300, tags: ["documentation"] },
);

export type UploadPhotoMeta = {
  title: string;
  /** `YYYY-MM-DD` atau null. */
  date: string | null;
  uploadedBy: string;
};

/** Upload buffer WebP ke folder dokumentasi. */
export async function uploadDocumentationPhoto(
  buffer: Buffer,
  meta: UploadPhotoMeta,
): Promise<{ id: string | null; name: string | null; webViewLink: string | null }> {
  const drive = await getDrive();
  const name = `${meta.date ? `${meta.date} ` : ""}${meta.title}.webp`;

  const appProperties: Record<string, string> = {
    uploadedBy: meta.uploadedBy.slice(0, 100),
    uploadedAt: new Date().toISOString(),
  };
  if (meta.date) appProperties.date = meta.date;

  const res = await drive.files.create({
    requestBody: {
      name,
      parents: [getDocumentationFolderId()],
      description: meta.title,
      appProperties,
    },
    media: {
      mimeType: "image/webp",
      body: Readable.from(buffer),
    },
    fields: "id,name,webViewLink",
    supportsAllDrives: true,
  });

  return {
    id: res.data.id ?? null,
    name: res.data.name ?? null,
    webViewLink: res.data.webViewLink ?? null,
  };
}

/** Stream isi file untuk proxy `/api/dokumentasi/[fileId]`. */
export async function getDocumentationPhotoMedia(fileId: string): Promise<{
  stream: Readable;
  mimeType: string;
}> {
  const drive = await getDrive();
  const res = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "stream" },
  );

  const headers = res.headers as Record<string, string | undefined>;
  return {
    stream: res.data as Readable,
    mimeType: headers["content-type"] ?? "image/webp",
  };
}
