"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";

import { DocumentationLightbox } from "@/components/gallery/documentation-lightbox";

export type PhotoItem = {
  id: string;
  title: string;
  /** Sudah diformat di server, mis. "12 Okt 2026". */
  date?: string;
  width?: number | null;
  height?: number | null;
};

type DocumentationGalleryProps = {
  photos: PhotoItem[];
};

/** Container variant untuk stagger effect */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

/** Card item variant untuk animasi muncul dari bawah */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] as const },
  },
};

/** Galeri masonry foto Drive; klik kartu → lightbox (DESIGN.md §7.25). */
export function DocumentationGallery({ photos }: DocumentationGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 space-y-4"
      >
        {photos.map((photo, index) => {
          // Rasio dari dimensi asli; fallback 4:3 kalau metadata tidak tersedia.
          const ratio = photo.width && photo.height ? photo.width / photo.height : 4 / 3;

          return (
            <motion.button
              key={photo.id}
              type="button"
              variants={itemVariants}
              onClick={() => setOpenIndex(index)}
              aria-label={`Buka foto: ${photo.title}`}
              className="group relative block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-xl border border-border bg-background-elevated text-left shadow-card transition-shadow duration-200 hover:shadow-lg focus-visible:outline-none focus-visible:shadow-focus"
            >
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: ratio }}>
                <Image
                  src={`/api/dokumentasi/${photo.id}`}
                  alt={photo.title}
                  fill
                  unoptimized
                  loading="lazy"
                  className="object-cover transition duration-300 ease-brand group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Gradient Overlay & Metadata saat Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition duration-200 ease-brand group-hover:opacity-100 group-focus-visible:opacity-100 flex flex-col justify-end p-4 text-white">
                  <p className="text-sm font-semibold leading-snug">{photo.title}</p>
                  {photo.date ? <p className="mt-1 text-xs text-white/80">{photo.date}</p> : null}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {openIndex !== null ? (
        <DocumentationLightbox
          photos={photos}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      ) : null}
    </>
  );
}
