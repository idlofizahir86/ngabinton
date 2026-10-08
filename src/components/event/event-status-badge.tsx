import { cn } from "@/lib/utils/cn";
import type { EventStatus } from "@/lib/types/event";

const LABELS: Record<EventStatus, string> = {
  upcoming: "Akan Datang",
  live: "Live",
  past: "Selesai",
};

const STATUS_CLASSES: Record<EventStatus, string> = {
  // COMPONENTS.md §3.5. Catatan a11y: `text-primary` di atas gelap kontrasnya rendah
  // (DESIGN.md §8.1) — akan ditinjau di M10-06.
  upcoming: "border border-primary bg-transparent text-primary",
  live: "bg-live/20 text-live",
  past: "bg-surface-hover text-text-muted",
};

const SIZE_CLASSES: Record<"sm" | "md", string> = {
  sm: "px-2.5 py-1 text-[10px]",
  md: "px-3 py-1 text-xs",
};

export type EventStatusBadgeProps = {
  status: EventStatus;
  size?: "sm" | "md";
};

/** Badge status event — selalu ada teks, bukan hanya warna (COMPONENTS.md §3.5). */
export function EventStatusBadge({ status, size = "sm" }: EventStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill font-semibold uppercase tracking-[0.04em]",
        SIZE_CLASSES[size],
        STATUS_CLASSES[status],
      )}
    >
      {status === "live" ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-pill bg-live" aria-hidden />
      ) : null}
      {LABELS[status]}
    </span>
  );
}
