import { Flame } from "lucide-react";
import Link from "next/link";

import { AchievementBadges } from "@/components/member/achievement-badge";
import { MemberAvatar } from "@/components/member/member-avatar";
import type { Achievement } from "@/lib/api/achievements";
import type { LeaderboardRow } from "@/lib/api/members";
import { standingLabel } from "@/lib/members/name";
import { cn } from "@/lib/utils/cn";

export type LeaderboardTableProps = {
  rows: LeaderboardRow[];
  /** `true` untuk pengguna yang sudah login (nama lengkap), `false` untuk pengunjung. */
  reveal: boolean;
  /** Pencapaian per `subjectKey`; badge hanya tampil untuk anggota. */
  achievements?: Map<string, Achievement[]>;
  /** `subjectKey` penerima Pang-Tangguh periode ini — diberi aksen `live`. */
  highlightKeys?: Set<string>;
  /** Nomor urut awal; dipakai saat peringkat 1–3 sudah tampil di podium. */
  startRank?: number;
};

/** Peringkat 1–3 dapat aksen merah; sisanya netral (DESIGN.md §3.4). */
function rankClass(rank: number): string {
  return rank <= 3 ? "text-primary" : "text-text-subtle";
}

/** Tabel Pang-Giatna Ngabinton (papan peringkat EXP) — `/leaderboard`. */
export function LeaderboardTable({
  rows,
  reveal,
  achievements,
  highlightKeys,
  startRank = 1,
}: LeaderboardTableProps) {
  return (
    <ol className="divide-y divide-border rounded-lg border border-border bg-surface">
      {rows.map((row, index) => {
        const rank = startRank + index;
        const highlighted = highlightKeys?.has(row.key) ?? false;
        const winRate =
          row.stats.setsPlayed > 0
            ? Math.round((row.stats.setsWon / row.stats.setsPlayed) * 100)
            : 0;
        const badgeList =
          reveal && row.kind === "member" ? (achievements?.get(row.key) ?? []) : [];
        const label = standingLabel(row, reveal);

        return (
          <li
            key={row.key}
            className={cn(
              "flex items-center gap-3 border-l-2 px-4 py-3 sm:gap-4 sm:px-5",
              highlighted ? "border-live bg-live/5" : "border-transparent",
            )}
          >
            <span
              className={cn(
                "w-7 shrink-0 text-right font-display text-xl tabular-nums sm:w-8",
                rankClass(rank),
              )}
            >
              {rank}
            </span>
            <MemberAvatar
              name={row.nickname || row.displayName}
              avatarKey={row.avatarKey}
              avatarUrl={row.avatarUrl}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {reveal && row.kind === "member" && row.username ? (
                  <Link
                    href={`/u/${row.username}`}
                    className="truncate font-semibold text-text underline-offset-4 hover:underline"
                  >
                    {label}
                  </Link>
                ) : (
                  <p className="truncate font-semibold text-text">{label}</p>
                )}
                {row.kind === "guest" ? (
                  <span className="rounded-pill bg-surface-hover px-2 py-0.5 text-[10px] uppercase tracking-[0.04em] text-text-subtle">
                    BaturanNgabinton
                  </span>
                ) : null}
                {highlighted ? (
                  <span className="inline-flex items-center gap-1 rounded-pill border border-live/40 bg-live/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-live">
                    <Flame className="h-3 w-3" aria-hidden />
                    Pang-Tangguh
                  </span>
                ) : null}
                {badgeList.length > 0 ? (
                  <AchievementBadges achievements={badgeList} />
                ) : null}
              </div>
              <p className="text-xs text-text-muted">
                {row.stats.sessions} sesi · {row.stats.games} game · {row.stats.setsWon}/
                {row.stats.setsPlayed} set ({winRate}%)
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-xl tabular-nums text-text">{row.exp}</p>
              <p className="text-[10px] uppercase tracking-[0.04em] text-text-muted">EXP</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
