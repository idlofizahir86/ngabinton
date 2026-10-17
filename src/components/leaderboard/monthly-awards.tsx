import { Crown, Flame } from "lucide-react";

import { MemberAvatar } from "@/components/member/member-avatar";
import type { Achievement } from "@/lib/api/achievements";
import { ACHIEVEMENT_QUOTES } from "@/lib/api/achievements";
import type { StandingRow } from "@/lib/api/rankings";
import { maskName, memberLabel } from "@/lib/members/name";
import { cn } from "@/lib/utils/cn";

export type AwardEntry = {
  achievement: Achievement;
  standing: StandingRow | null;
};

function entryName(entry: AwardEntry, reveal: boolean): string {
  const standing = entry.standing;
  if (!standing) return reveal ? entry.achievement.label : "****";
  if (standing.kind === "guest") {
    return reveal ? standing.displayName : maskName(standing.displayName);
  }
  return memberLabel(
    { nickname: standing.nickname, username: standing.username ?? standing.displayName },
    reveal,
  );
}

function entryAvatar(entry: AwardEntry) {
  const standing = entry.standing;
  return {
    name: standing?.nickname || standing?.displayName || "Anggota",
    avatarKey: standing?.avatarKey ?? null,
    avatarUrl: standing?.avatarUrl ?? null,
  };
}

export type MonthlyAwardsProps = {
  periodLabel: string;
  ace: AwardEntry[];
  tangguh: AwardEntry[];
  reveal: boolean;
};

/**
 * Tampilan khusus awal bulan: ACE Of The Month (top 3) + Pang-Tangguh Of The Month
 * dari bulan sebelumnya (RULES.md §13.5).
 */
export function MonthlyAwards({ periodLabel, ace, tangguh, reveal }: MonthlyAwardsProps) {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-warning" aria-hidden />
          <h2 className="font-display text-2xl text-text">ACE Of The Month</h2>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Tiga EXP tertinggi sepanjang {periodLabel}.
        </p>

        {ace.length > 0 ? (
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {ace.map((entry) => {
              const rank = entry.achievement.rank ?? 0;
              const avatar = entryAvatar(entry);
              return (
                <li
                  key={entry.achievement.id}
                  className={cn(
                    "relative rounded-lg border bg-surface p-5",
                    rank === 1 ? "border-warning/60" : "border-border",
                  )}
                >
                  <span
                    className={cn(
                      "absolute right-4 top-4 font-display text-2xl tabular-nums",
                      rank === 1 ? "text-warning" : "text-text-subtle",
                    )}
                  >
                    #{rank}
                  </span>
                  <MemberAvatar
                    name={avatar.name}
                    avatarKey={avatar.avatarKey}
                    avatarUrl={avatar.avatarUrl}
                    size="md"
                  />
                  <p className="mt-3 truncate font-semibold text-text">
                    {entryName(entry, reveal)}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {entry.standing?.stats.sessions ?? 0} sesi ·{" "}
                    {entry.standing?.stats.games ?? 0} game
                  </p>
                  <p className="mt-3 font-display text-3xl tabular-nums text-primary">
                    {entry.standing?.exp ?? 0}
                    <span className="ml-1 text-xs uppercase tracking-[0.04em] text-text-muted">
                      EXP
                    </span>
                  </p>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-5 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
            Belum ada pencapaian ACE untuk periode ini.
          </p>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-live" aria-hidden />
          <h2 className="font-display text-2xl text-text">Pang-Tangguh Of The Month</h2>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-text-muted">
          {ACHIEVEMENT_QUOTES.pang_tangguh_of_month}
        </p>

        {tangguh.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-3">
            {tangguh.map((entry) => {
              const avatar = entryAvatar(entry);
              return (
                <li
                  key={entry.achievement.id}
                  className="flex flex-wrap items-center gap-4 rounded-lg border border-live/40 bg-live/5 p-5"
                >
                  <MemberAvatar
                    name={avatar.name}
                    avatarKey={avatar.avatarKey}
                    avatarUrl={avatar.avatarUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text">
                      {entryName(entry, reveal)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {entry.achievement.description} · {entry.standing?.stats.games ?? 0} game
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl tabular-nums text-live">
                      {entry.standing?.exp ?? 0}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.04em] text-text-muted">EXP</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-5 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
            Belum ada Pang-Tangguh untuk periode ini.
          </p>
        )}
      </section>
    </div>
  );
}
