import { Bus, Car } from "lucide-react";
import Image from "next/image";

export type TransportCardProps = {
  mode: string;
  description: string;
  pickupPoints: string[];
  image?: string;
  imageAlt?: string;
};

/**
 * Pilih ikon kendaraan dari nama moda (Lucide) — COMPONENTS.md §4.4.
 * Heuristik sederhana: moda berbau bus/angkot → `Bus`, sisanya `Car`.
 */
function getTransportIcon(mode: string) {
  return /bus|angkot|bis|minibus|elf/i.test(mode) ? Bus : Car;
}

/**
 * Card transportasi — COMPONENTS.md §4.4 / DESIGN.md §7.9.
 * Server Component. Satu aksen saja (`story-orange`): ikon + dot titik jemput
 * (DESIGN.md §3 aturan "tidak ada dua warna aksen dalam satu komponen").
 */
export function TransportCard({
  mode,
  description,
  pickupPoints,
  image,
  imageAlt,
}: TransportCardProps) {
  const Icon = getTransportIcon(mode);

  return (
    <div className="rounded-lg bg-story-bg-alt p-8">
      <Icon aria-hidden strokeWidth={1.5} className="h-16 w-16 text-story-orange" />

      <h3 className="mt-4 text-xl font-semibold text-story-text md:text-2xl">{mode}</h3>

      <p className="mt-3 text-base leading-[1.7] text-story-text-secondary">{description}</p>

      {pickupPoints.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.04em] text-story-muted">Titik jemput</p>

          <ul className="mt-3 space-y-2">
            {pickupPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-base text-story-text-secondary"
              >
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-story-orange"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {image ? (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-md">
          <Image
            src={image}
            alt={imageAlt ?? mode}
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            className="object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}
