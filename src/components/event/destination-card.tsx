import Image from "next/image";

import { buttonClass } from "@/components/ui/button";

export type DestinationCardProps = {
  name: string;
  region: string;
  description: string;
  image: string;
  imageAlt?: string;
  /** Durasi kunjungan, mis. "08.30 – 12.15 (≈ 3j 45m)". */
  duration?: string;
  mapsUrl?: string;
};

/**
 * Card destinasi travel — COMPONENTS.md §4.3.
 * Server Component. Gambar kiri / konten kanan di desktop; mobile satu kolom.
 */
export function DestinationCard({
  name,
  region,
  description,
  image,
  imageAlt,
  duration,
  mapsUrl,
}: DestinationCardProps) {
  return (
    <article className="overflow-hidden rounded-lg bg-story-surface shadow-story md:grid md:grid-cols-2">
      <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-72">
        <Image
          src={image}
          alt={imageAlt ?? name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      <div className="p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.04em] text-story-teal">{region}</p>

        <h3 className="mt-2 text-xl font-semibold text-story-text md:text-2xl">{name}</h3>

        <p className="mt-3 text-base leading-[1.7] text-story-text-secondary">{description}</p>

        {duration ? (
          <p className="mt-5 inline-block rounded-sm bg-story-bg-alt px-2 py-1 text-xs tracking-[0.04em] text-story-muted">
            {duration}
          </p>
        ) : null}

        {mapsUrl ? (
          <div className="mt-6">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonClass("story-ghost", "sm")}
            >
              Buka di Maps
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}
