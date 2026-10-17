import Link from "next/link";

import { AchievementBadges } from "@/components/member/achievement-badge";
import { MemberAvatar } from "@/components/member/member-avatar";
import type { Achievement } from "@/lib/api/achievements";
import type { LeaderboardRow } from "@/lib/api/members";
import { maskName, memberLabel } from "@/lib/members/name";
import { cn } from "@/lib/utils/cn";

export type LeaderboardTableProps = {
  rows: LeaderboardRow[];
  /** `true` untuk pengguna yang sudah login (nama lengkap), `false` untuk pengunjung. */
  reveal: boolean;
  /** Pencapaian per `subjectKey`; badge hanya tampil untuk anggota. */
  achievements?: Map<string, Achievement[]>;
};

/** Peringkat 1–3 dapat aksen merah; sisanya netral (DESIGN.md §3.4). */
function rankClass(rank: number): string {
  return rank <= 3 ? "text-primary" : "text-text-subtle";
}

function rowLabel(row: LeaderboardRow, reveal: boolean): string {
  if (row.kind === "guest") {
    return reveal ? row.displayName : maskName(row.displayName);
  }
  return memberLabel(
    { nickname: row.nickname, username: row.username ?? row.displayName },
    reveal,
  );
}

/** Tabel Pang-Giatna Ngabinton (papan peringkat EXP) — `/leaderboard`. */
export function LeaderboardTable({ rows, reveal, achievements }: LeaderboardTableProps) {
  return (
    <ol className="divide-y divide-border rounded-lg border border-border bg-surface">
      {rows.map((row, index) => {
        const rank = index + 1;
        const winRate =
          row.stats.setsPlayed > 0
            ? Math.round((row.stats.setsWon / row.stats.setsPlayed) * 100)
            : 0;
        const badgeList =
          reveal && row.kind === "member" ? (achievements?.get(row.key) ?? []) : [];
        const label = rowLabel(row, reveal);

        return (
          <li key={row.key} className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
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
