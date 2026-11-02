import { Crown, Flame } from "lucide-react";
import Link from "next/link";

import { MemberAvatar } from "@/components/member/member-avatar";
import type { StandingRow } from "@/lib/api/rankings";
import { standingLabel } from "@/lib/members/name";
import { cn } from "@/lib/utils/cn";

export type PodiumEntry = {
  key: string;
  /** 1–3; menentukan tinggi panggung & aksen warna. */
  rank: number;
  label: string;
  avatarName: string;
  avatarKey: string | null;
  avatarUrl: string | null;
  exp: number;
  sessions: number;
  games: number;
  /** Penerima Pang-Tangguh Of The Month pada periode ini. */
  tangguh: boolean;
  /** Tautan profil — hanya untuk anggota & pengunjung yang sudah login. */
  href: string | null;
};

/** Ubah baris papan peringkat menjadi entri podium (DESIGN.md §7.23). */
export function podiumEntryFromStanding(
  row: StandingRow,
  rank: number,
  reveal: boolean,
  tangguh: boolean,
): PodiumEntry {
  return {
    key: row.key,
    rank,
    label: standingLabel(row, reveal),
    avatarName: row.nickname || row.displayName,
    avatarKey: row.avatarKey,
    avatarUrl: row.avatarUrl,
    exp: row.exp,
    sessions: row.stats.sessions,
    games: row.stats.games,
    tangguh,
    href: reveal && row.kind === "member" && row.username ? `/u/${row.username}` : null,
  };
}

type PodiumStyle = {
  card: string;
  step: string;
  numeral: string;
  height: string;
  avatarRing: string;
  avatarClass: string;
};

/** Aksen token: emas `warning`, perak `border-strong`, perunggu `border` (DESIGN.md §7.23). */
const PODIUM_STYLES: Record<number, PodiumStyle> = {
  1: {
    card: "border-warning/60 bg-warning/5",
    step: "border-warning/50 bg-warning/10",
    numeral: "text-warning",
    height: "h-28 sm:h-44",
    avatarRing: "ring-2 ring-warning/70",
    avatarClass: "sm:h-16 sm:w-16 sm:text-xl",
  },
  2: {
    card: "border-border-strong/50 bg-surface",
    step: "border-border-strong/40 bg-surface-hover",
    numeral: "text-text-secondary",
    height: "h-24 sm:h-36",
    avatarRing: "ring-1 ring-border-strong/70",
    avatarClass: "sm:h-14 sm:w-14",
  },
  3: {
    card: "border-border bg-surface",
    step: "border-border bg-surface",
    numeral: "text-text-subtle",
    height: "h-20 sm:h-32",
    avatarRing: "ring-1 ring-border",
    avatarClass: "sm:h-14 sm:w-14",
  },
};

/** Urutan visual: #2 · #1 · #3 — juga berlaku di mobile agar tetap berbentuk podium. */
const ORDER_CLASSES: Record<number, string> = {
  1: "order-2",
  2: "order-1",
  3: "order-3",
};

/**
 * Podium ACE Of The Month (peringkat 1–3) — `/leaderboard` (DESIGN.md §7.23).
 * Panggung naik berurutan saat dimuat (CSS) dan tetap podium di layar kecil.
 */
export function MonthlyPodium({
  entries,
  className,
}: {
  entries: PodiumEntry[];
  className?: string;
}) {
  if (entries.length === 0) return null;

  return (
    <div className={className}>
      <ol
        aria-label="Podium ACE Of The Month"
        className="grid grid-cols-3 items-end gap-1.5 sm:grid-cols-[1fr_1.2fr_1fr] sm:gap-3"
      >
        {entries.map((entry, index) => (
          <PodiumItem key={entry.key} entry={entry} order={index} />
        ))}
      </ol>
      <div aria-hidden className="h-1 rounded-pill bg-border-strong/40" />
    </div>
  );
}

function PodiumItem({ entry, order }: { entry: PodiumEntry; order: number }) {
  const style = PODIUM_STYLES[entry.rank] ?? PODIUM_STYLES[3];
  const isChampion = entry.rank === 1;
  const delay = `${order * 110}ms`;

  return (
    <li className={cn("flex flex-col", ORDER_CLASSES[entry.rank] ?? "order-3")}>
      <div
        className={cn(
          "ngbt-podium-card flex min-h-[9rem] flex-col items-center justify-center gap-2 rounded-t-lg border border-b-0 px-2 pb-3 pt-3 text-center sm:min-h-[12rem] sm:gap-2.5 sm:px-3 sm:pb-4 sm:pt-4",
          style.card,
        )}
        style={{ animationDelay: delay }}
      >
        <span className="sr-only">Peringkat {entry.rank}</span>

        {isChampion ? (
          <Crown className="h-4 w-4 text-warning sm:h-5 sm:w-5" aria-hidden />
        ) : null}

        <span className={cn("inline-flex rounded-pill p-0.5", style.avatarRing)}>
          <MemberAvatar
            name={entry.avatarName}
            avatarKey={entry.avatarKey}
            avatarUrl={entry.avatarUrl}
            size={isChampion ? "md" : "sm"}
            className={style.avatarClass}
          />
        </span>

        {entry.href ? (
          <Link
            href={entry.href}
            className="w-full truncate text-[11px] font-semibold text-text underline-offset-4 hover:underline sm:text-sm"
          >
            {entry.label}
          </Link>
        ) : (
          <p className="w-full truncate text-[11px] font-semibold text-text sm:text-sm">
            {entry.label}
          </p>
        )}

        <p className="text-[10px] text-text-muted sm:text-[11px]">
          <span className="sm:hidden">{entry.sessions} sesi</span>
          <span className="hidden sm:inline">
            {entry.sessions} sesi · {entry.games} game
          </span>
        </p>

        {entry.tangguh ? (
          <span className="inline-flex items-center gap-1 rounded-pill border border-live/40 bg-live/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.04em] text-live sm:px-2 sm:text-[10px]">
            <Flame className="h-3 w-3" aria-hidden />
            <span className="hidden sm:inline">Pang-Tangguh</span>
            <span className="sr-only sm:hidden">Pang-Tangguh Of The Month</span>
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "ngbt-podium-step flex flex-col items-center justify-center gap-1 rounded-b-lg border px-1 sm:px-3",
          style.step,
          style.height,
        )}
        style={{ animationDelay: delay }}
      >
        <span
          aria-hidden
          className={cn(
            "ngbt-podium-numeral font-display leading-none tabular-nums",
            style.numeral,
            "text-3xl sm:text-6xl",
          )}
          style={{ animationDelay: `${order * 110 + 260}ms` }}
        >
          {entry.rank}
        </span>
        <span className="inline-flex items-baseline gap-1">
          <span className="font-display text-sm tabular-nums text-text sm:text-2xl">
            {entry.exp}
          </span>
          <span className="text-[9px] uppercase tracking-[0.04em] text-text-muted sm:text-[10px]">
            EXP
          </span>
        </span>
      </div>
    </li>
  );
}
