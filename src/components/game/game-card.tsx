import { ArrowUpRight, Gamepad2, MonitorSmartphone } from "lucide-react";
import Link from "next/link";

import type { GameInfo } from "@/lib/games/catalog";
import { cn } from "@/lib/utils/cn";

export type GameCardProps = {
  game: GameInfo;
  /** Peringkat teratas (nama sudah disensor sesuai status login). */
  leader: { label: string; value: number } | null;
};

/** Kartu satu mini-game di halaman Arena Mainan. */
export function GameCard({ game, leader }: GameCardProps) {
  return (
    <Link
      href={`/mainan/${game.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-card transition duration-200 ease-brand hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-hover hover:shadow-card-hover focus-visible:outline-none focus-visible:shadow-focus sm:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-primary/10 to-transparent"
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-pill border border-border px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-text-muted">
            <Gamepad2 aria-hidden className="h-3 w-3" />
            {game.online ? "Online" : "Solo"}
          </span>
          <ArrowUpRight
            aria-hidden
            className="h-5 w-5 text-text-subtle transition duration-150 ease-brand group-hover:text-primary"
          />
        </div>

        <h3 className="mt-6 font-display text-3xl leading-[1.05] text-text sm:text-4xl">
          {game.title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
          {game.tagline}
        </p>
      </div>

      <div className="relative mt-8 space-y-3">
        <p className="inline-flex items-center gap-2 rounded-pill bg-background-elevated px-3 py-1 text-xs text-text-secondary">
          {game.level}
        </p>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-text-subtle">
          <MonitorSmartphone aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {game.controls}
        </p>
        <div className="flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-text-subtle">
              Pemimpin Pang-Jagona
            </p>
            <p
              className={cn(
                "mt-0.5 text-sm font-semibold",
                leader ? "text-text" : "text-text-subtle",
              )}
            >
              {leader ? leader.label : "Belum ada"}
            </p>
          </div>
          {leader ? (
            <p className="font-display text-2xl tabular-nums text-primary">
              {leader.value.toLocaleString("id-ID")}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
