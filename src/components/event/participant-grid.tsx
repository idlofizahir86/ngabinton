import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export type ParticipantImage = {
  url: string;
  alt: string;
};

export type ParticipantGridProps = {
  images: ParticipantImage[];
  /** Jumlah kolom desktop (default 4). Mobile selalu 2, tablet maksimum 3. */
  columns?: 2 | 3 | 4;
};

const COLUMN_CLASSES: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

/** Perkiraan lebar tampil untuk `next/image` (mengikuti jumlah kolom). */
const IMAGE_SIZES: Record<2 | 3 | 4, string> = {
  2: "(max-width: 640px) 50vw, 50vw",
  3: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw",
  4: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
};

/**
 * Grid foto peserta gaya kolase — COMPONENTS.md §4.7 / DESIGN.md §7.13.
 * Server Component. Nama peserta tidak pernah ditampilkan (privacy default, RULES.md §5.3).
 */
export function ParticipantGrid({ images, columns = 4 }: ParticipantGridProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <ul className={cn("grid gap-2", COLUMN_CLASSES[columns])}>
      {images.map((image) => (
        <li key={image.url} className="relative aspect-square overflow-hidden rounded-md">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes={IMAGE_SIZES[columns]}
            className="object-cover transition duration-200 ease-brand hover:scale-[1.03]"
          />
        </li>
      ))}
    </ul>
  );
}
