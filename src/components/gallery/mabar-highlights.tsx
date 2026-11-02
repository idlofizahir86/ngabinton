import Link from "next/link";
import { Play } from "lucide-react";

import type { StoryHighlight } from "@/lib/api/session-media";
import { formatDateShort } from "@/lib/utils/format";

/**
 * Highlight Mabar Seruu per sesi di Arsip Dokumentasi (DESIGN.md §7.24).
 * Memakai **grid masonry yang sama** dengan galeri foto
 * (`<DocumentationGallery />`) supaya arsip terasa satu kesatuan.
 */
export function MabarHighlights({ highlights }: { highlights: StoryHighlight[] }) {
  if (highlights.length === 0) return null;

  return (
    <div className="mt-4 columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {highlights.map((highlight) => (
        <Link
          key={highlight.sessionId ?? `tanpa-sesi-${highlight.title}`}
          href={
            highlight.sessionId
              ? `/dokumentasi/mabar-seruu?sesi=${highlight.sessionId}`
              : "/dokumentasi/mabar-seruu"
          }
          className="group relative block break-inside-avoid overflow-hidden rounded-xl border border-border bg-background-elevated shadow-card transition-shadow duration-200 hover:shadow-lg"
        >
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 5" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- media dinamis dari Supabase Storage */}
            <img
              src={highlight.coverUrl}
              alt={highlight.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 ease-brand group-hover:scale-105"
            />

            {/* Penanda sesi — selalu tampil karena mobile tidak punya hover */}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-pill bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-on-primary">
              <Play className="h-3 w-3" aria-hidden />
              Mabar Seruu
            </span>

            {/* Keterangan sesi */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 text-white">
              <p className="line-clamp-2 text-sm font-semibold leading-snug">
                {highlight.title}
              </p>
              <p className="mt-1 text-xs text-white/80">
                {highlight.count} momen
                {highlight.playedAt ? ` · ${formatDateShort(highlight.playedAt)}` : ""}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
