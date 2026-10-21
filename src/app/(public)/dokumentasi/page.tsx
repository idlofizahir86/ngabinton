import type { Metadata } from "next";
import Link from "next/link";
import { Upload } from "lucide-react";

import { Container } from "@/components/layout/container";
import {
  DocumentationGallery,
  type PhotoItem,
} from "@/components/gallery/documentation-gallery";
import { getDocumentationPhotos } from "@/lib/google/drive";
import { formatDateShort } from "@/lib/utils/format";

/** Revalidate tiap 5 menit (300 detik) */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Arsip Dokumentasi — NGABINTON",
  description:
    "Kumpulan foto dan momen keseruan event serta mabar komunitas NGABINTON.",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toPhotoItem(
  photo: Awaited<ReturnType<typeof getDocumentationPhotos>>[number],
): PhotoItem {
  const date = photo.date && ISO_DATE.test(photo.date) ? formatDateShort(photo.date) : undefined;

  return {
    id: photo.id,
    title: photo.title,
    date,
    width: photo.width,
    height: photo.height,
  };
}

export default async function DokumentasiPage() {
  // Sumber: folder Google Drive (sudah di-cache 5 menit + error-safe).
  const photos = (await getDocumentationPhotos()).map(toPhotoItem);

  return (
    <div className="pb-24 pt-28">
      <Container size="full">
        {/* Header Section */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-text md:text-[56px]">
              Arsip Dokumentasi
            </h1>
            <p className="mt-4 max-w-2xl text-base text-text-muted md:text-lg">
              Potret keseruan, tawa, dan aksi smash epik di lapangan. Bebas
              upload kenangan kamu di sini!
            </p>
          </div>

          {/* Button Upload */}
          <Link
            href="/dokumentasi/upload"
            className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-5 font-semibold text-on-primary transition duration-150 ease-brand hover:opacity-90 shrink-0"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Foto</span>
          </Link>
        </div>

        {/* Gallery Masonry */}
        {photos.length > 0 ? (
          <DocumentationGallery photos={photos} />
        ) : (
          <p className="mt-12 text-text-muted">
            Belum ada dokumentasi. Jadi yang pertama mengunggah momen keseruan!
          </p>
        )}
      </Container>
    </div>
  );
}
