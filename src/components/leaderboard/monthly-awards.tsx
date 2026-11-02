import { Crown, Flame } from "lucide-react";

import {
  MonthlyPodium,
  type PodiumEntry,
} from "@/components/leaderboard/monthly-podium";
import { MemberAvatar } from "@/components/member/member-avatar";
import type { Achievement } from "@/lib/api/achievements";
import { ACHIEVEMENT_QUOTES } from "@/lib/api/achievements";
import type { StandingRow } from "@/lib/api/rankings";
import { standingLabel } from "@/lib/members/name";

export type AwardEntry = {
  achievement: Achievement;
  standing: StandingRow | null;
};

function entryName(entry: AwardEntry, reveal: boolean): string {
  const standing = entry.standing;
  if (!standing) return reveal ? entry.achievement.label : "****";
  return standingLabel(standing, reveal);
}

function entryAvatar(entry: AwardEntry) {
  const standing = entry.standing;
  return {
    name: standing?.nickname || standing?.displayName || "Anggota",
    avatarKey: standing?.avatarKey ?? null,
    avatarUrl: standing?.avatarUrl ?? null,
  };
}

function toPodiumEntry(entry: AwardEntry, rank: number, reveal: boolean): PodiumEntry {
  const avatar = entryAvatar(entry);
  const standing = entry.standing;
  return {
    key: String(entry.achievement.id),
    rank,
    label: entryName(entry, reveal),
    avatarName: avatar.name,
    avatarKey: avatar.avatarKey,
    avatarUrl: avatar.avatarUrl,
    exp: standing?.exp ?? 0,
    sessions: standing?.stats.sessions ?? 0,
    games: standing?.stats.games ?? 0,
    tangguh: false,
    href:
      reveal && standing?.kind === "member" && standing.username
        ? `/u/${standing.username}`
        : null,
  };
}

export type MonthlyAwardsProps = {
  periodLabel: string;
  ace: AwardEntry[];
  tangguh: AwardEntry[];
  reveal: boolean;
};

/**
 * Tampilan khusus awal bulan: ACE Of The Month (podium top 3) + Pang-Tangguh
 * Of The Month dari bulan sebelumnya (RULES.md §13.6, DESIGN.md §7.23).
 */
export function MonthlyAwards({ periodLabel, ace, tangguh, reveal }: MonthlyAwardsProps) {
  const podiumEntries = ace.map((entry, index) =>
    toPodiumEntry(entry, entry.achievement.rank ?? index + 1, reveal),
  );

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

        {podiumEntries.length > 0 ? (
          <MonthlyPodium entries={podiumEntries} className="mt-6" />
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
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {tangguh.map((entry) => (
              <TangguhCard key={entry.achievement.id} entry={entry} reveal={reveal} />
            ))}
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

function TangguhCard({ entry, reveal }: { entry: AwardEntry; reveal: boolean }) {
  const avatar = entryAvatar(entry);
  const stats = entry.standing?.stats;

  return (
    <li className="relative overflow-hidden rounded-lg border border-live/40 bg-live/5 p-5 pl-6">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-live" />

      <div className="flex items-start gap-4">
        <MemberAvatar
          name={avatar.name}
          avatarKey={avatar.avatarKey}
          avatarUrl={avatar.avatarUrl}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 rounded-pill border border-live/40 bg-live/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-live">
            <Flame className="h-3 w-3" aria-hidden />
            Pang-Tangguh
          </span>
          <p className="mt-2 truncate font-display text-xl text-text">
            {entryName(entry, reveal)}
          </p>
          <p className="text-xs text-text-muted">{entry.achievement.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-3xl tabular-nums text-text">
            {entry.standing?.exp ?? 0}
          </p>
          <p className="text-[10px] uppercase tracking-[0.04em] text-text-muted">EXP</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-live/20 pt-3 text-center">
        <Stat label="Sesi" value={stats?.sessions ?? 0} />
        <Stat label="Game" value={stats?.games ?? 0} />
        <Stat label="Set" value={`${stats?.setsWon ?? 0}/${stats?.setsPlayed ?? 0}`} />
      </dl>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] uppercase tracking-[0.04em] text-text-muted">{label}</dt>
      <dd className="font-display text-lg tabular-nums text-text">{value}</dd>
    </div>
  );
}
