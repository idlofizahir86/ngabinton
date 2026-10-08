import Image from "next/image";
import Link from "next/link";

import { EventStatusBadge } from "@/components/event/event-status-badge";
import type { Event } from "@/lib/types/event";
import { cn } from "@/lib/utils/cn";
import { getEventStatus } from "@/lib/utils/event-status";
import { formatDate } from "@/lib/utils/format";

const SIZE_CLASSES: Record<"sm" | "md" | "lg", string> = {
  sm: "w-[200px]",
  md: "w-[280px]",
  lg: "w-[360px]",
};

/** Ambil label volume dari judul (mis. "Vol. 1") — tidak ada kolom khusus di schema. */
function getVolumeLabel(title: string): string | null {
  const match = title.match(/vol\.?\s*(\d+)/i);
  return match ? `Vol. ${match[1]}` : null;
}

export type EventCardProps = {
  event: Event;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
};

/**
 * Kartu event untuk carousel/arsip — COMPONENTS.md §3.3.
 * Server Component (hover hanya CSS lewat `group-hover`).
 */
export function EventCard({ event, size = "md", showBadge = true }: EventCardProps) {
  const status = getEventStatus(event);
  const volume = getVolumeLabel(event.title);

  return (
    <Link
      href={`/${event.slug}`}
      className={cn(
        "group block shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        SIZE_CLASSES[size],
      )}
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-surface shadow-card transition duration-[250ms] ease-brand group-hover:scale-[1.04] group-hover:shadow-card-hover">
        {event.heroImageUrl ? (
          <Image
            src={event.heroImageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 200px, 280px"
            className="object-cover"
          />
        ) : null}

        {showBadge && volume ? (
          <span className="absolute left-2 top-2 rounded-sm bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-on-primary">
            {volume}
          </span>
        ) : null}

        <span className="absolute right-2 top-2">
          <EventStatusBadge status={status} />
        </span>

        <span
          aria-hidden
          className="absolute inset-0 bg-[rgba(0,0,0,0.3)] opacity-0 transition-opacity duration-150 ease-brand group-hover:opacity-100"
        />
      </div>

      <p className="mt-2 font-semibold text-text">{event.title}</p>
      <p className="text-xs text-text-muted">{formatDate(event.startsAt)}</p>
    </Link>
  );
}
