import Image from "next/image";

import { cn } from "@/lib/utils/cn";

export type StoryNarrativeProps = {
  title?: string;
  body: string;
  image?: string;
  imageAlt?: string;
  /** Posisi gambar di desktop; default `right` (teks kiri). */
  direction?: "left" | "right";
};

/**
 * Blok narasi dua kolom (60/40) — COMPONENTS.md §4.2.
 * Server Component. Ini blok konten: section + `Container` disediakan oleh halaman
 * (lihat `#narasi` di ROUTES.md §2.1), supaya mudah diurutkan.
 * Mobile: satu kolom, gambar di atas teks.
 */
export function StoryNarrative({
  title,
  body,
  image,
  imageAlt,
  direction = "right",
}: StoryNarrativeProps) {
  const imageFirst = direction === "left";

  return (
    <div className="grid items-center gap-8 lg:grid-cols-5 lg:gap-12">
      {image ? (
        <div className={cn("lg:col-span-2", imageFirst ? "lg:order-1" : "lg:order-2")}>
          <div className="relative aspect-video overflow-hidden rounded-lg shadow-story">
            <Image
              src={image}
              alt={imageAlt ?? title ?? ""}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          image ? "lg:col-span-3" : "lg:col-span-5",
          imageFirst ? "lg:order-2" : "lg:order-1",
        )}
      >
        {title ? (
          <h2 className="text-2xl font-semibold text-story-text md:text-3xl">{title}</h2>
        ) : null}

        <p className="mt-4 text-lg leading-[1.7] text-story-text-secondary">{body}</p>
      </div>
    </div>
  );
}
