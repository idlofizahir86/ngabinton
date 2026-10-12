import { MemberAvatar } from "@/components/member/member-avatar";
import type { LeaderboardRow } from "@/lib/api/members";
import { memberLabel } from "@/lib/members/name";
import { cn } from "@/lib/utils/cn";

export type LeaderboardTableProps = {
  rows: LeaderboardRow[];
  /** `true` untuk pengguna yang sudah login (nama lengkap), `false` untuk pengunjung. */
  reveal: boolean;
};

/** Peringkat 1–3 dapat aksen merah; sisanya netral (DESIGN.md §3.4). */
function rankClass(rank: number): string {
  return rank <= 3 ? "text-primary" : "text-text-subtle";
}

/** Tabel Pang-Giatna Ngabinton (papan peringkat EXP) — dipakai halaman `/leaderboard`. */
export function LeaderboardTable({ rows, reveal }: LeaderboardTableProps) {
  return (
    <ol className="divide-y divide-border rounded-lg border border-border bg-surface">
      {rows.map((row, index) => {
        const rank = index + 1;
        const winRate =
          row.stats.setsPlayed > 0
            ? Math.round((row.stats.setsWon / row.stats.setsPlayed) * 100)
            : 0;

        return (
          <li key={row.id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
            <span
              className={cn(
                "w-8 shrink-0 text-right font-display text-xl tabular-nums",
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
              <p className="truncate font-semibold text-text">{memberLabel(row, reveal)}</p>
              <p className="text-xs text-text-muted">
                {row.stats.games} game · {row.stats.setsWon}/{row.stats.setsPlayed} set ({winRate}%)
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
