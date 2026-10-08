import type { RundownItem } from "@/lib/types/event";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/format";

export type RundownTimelineProps = {
  items: RundownItem[];
  variant?: "cinema" | "storytelling";
  highlightNow?: boolean;
};

type Variant = "cinema" | "storytelling";

type VariantClasses = {
  time: string;
  rail: string;
  dot: string;
  title: string;
  note: string;
  badge: string;
  liveBg: string;
};

const VARIANT_CLASSES: Record<Variant, VariantClasses> = {
  cinema: {
    time: "text-text-subtle",
    rail: "border-border",
    dot: "bg-primary",
    title: "text-text",
    note: "text-text-muted",
    badge: "text-text-subtle",
    liveBg: "bg-surface",
  },
  storytelling: {
    time: "text-story-muted",
    rail: "border-story-border",
    dot: "bg-story-teal",
    title: "text-story-text",
    note: "text-story-muted",
    badge: "text-story-muted",
    liveBg: "bg-story-bg-alt",
  },
};

/**
 * Ambil jam mulai (menit sejak 00.00) dari string waktu rundown,
 * mis. `"06.00 – 08.30"` → `360`. `null` kalau tidak bisa dibaca.
 */
function parseStartMinutes(time: string): number | null {
  const match = time.match(/(\d{1,2})[.:](\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Index item rundown yang sedang berjalan (yang paling akhir dimulai) menurut
 * jam WIB. Perkiraan berbasis jam saja (bukan tanggal) — cukup untuk `highlightNow`.
 */
function findCurrentIndex(items: RundownItem[], now: Date = new Date()): number {
  const nowMinutes = parseStartMinutes(formatTime(now));
  if (nowMinutes === null) return -1;

  let current = -1;
  items.forEach((item, index) => {
    const start = parseStartMinutes(item.time);
    if (start !== null && start <= nowMinutes) {
      current = index;
    }
  });
  return current;
}

/**
 * Timeline rundown — COMPONENTS.md §3.7.
 * Kolom kiri waktu · rail garis + dot · kolom kanan aktivitas (judul + catatan).
 * Server Component. `variant` default `cinema`.
 */
export function RundownTimeline({
  items,
  variant = "cinema",
  highlightNow = false,
}: RundownTimelineProps) {
  const classes = VARIANT_CLASSES[variant];
  const currentIndex = highlightNow ? findCurrentIndex(items) : -1;

  return (
    <ol className="list-none">
      {items.map((item, index) => {
        const isLive = index === currentIndex;

        return (
          <li key={item.id} className="grid grid-cols-[100px_1fr] gap-x-6">
            <span className={cn("pt-0.5 text-sm tabular-nums", classes.time)}>{item.time}</span>

            <div
              className={cn(
                "relative pb-8 pl-6 last:pb-0",
                isLive
                  ? cn("border-l-2 border-l-live", classes.liveBg)
                  : cn("border-l", classes.rail),
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full",
                  isLive ? "animate-pulse bg-live" : classes.dot,
                )}
              />

              <p className={cn("font-semibold", classes.title)}>
                {item.title}
                {item.isOptional ? (
                  <span
                    className={cn(
                      "ml-2 text-[11px] uppercase tracking-[0.04em]",
                      classes.badge,
                    )}
                  >
                    Opsional
                  </span>
                ) : null}
              </p>

              {item.note ? <p className={cn("mt-1 text-sm", classes.note)}>{item.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
