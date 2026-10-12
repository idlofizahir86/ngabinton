import { MemberAvatar } from "@/components/member/member-avatar";
import { summarizeSets } from "@/lib/api/exp";
import type { PlaySessionDetail } from "@/lib/api/matches";
import { maskName, memberLabel } from "@/lib/members/name";
import { cn } from "@/lib/utils/cn";

type ExpRow = {
  key: string;
  name: string;
  avatarKey: string | null;
  avatarUrl: string | null;
  isMember: boolean;
  exp: number;
  games: number;
  setsWon: number;
  setsPlayed: number;
};

/** Hitung EXP & statistik tiap pemain dari seluruh game di satu sesi. */
function buildRows(session: PlaySessionDetail, reveal: boolean): ExpRow[] {
  const rows = new Map<string, ExpRow>();

  for (const match of session.matches) {
    const summary = summarizeSets(match.sets);
    for (const participant of match.participants) {
      const key = participant.userId ? `u:${participant.userId}` : `g:${participant.displayName}`;
      const name = participant.user
        ? memberLabel(participant.user, reveal)
        : reveal
          ? participant.displayName
          : maskName(participant.displayName);

      const row =
        rows.get(key) ??
        ({
          key,
          name,
          avatarKey: participant.user?.avatarKey ?? null,
          avatarUrl: participant.user?.avatarUrl ?? null,
          isMember: Boolean(participant.userId),
          exp: 0,
          games: 0,
          setsWon: 0,
          setsPlayed: 0,
        } satisfies ExpRow);

      row.exp += participant.side === "a" ? summary.expA : summary.expB;
      row.games += 1;
      row.setsWon += participant.side === "a" ? summary.winsA : summary.winsB;
      row.setsPlayed += match.sets.length;
      rows.set(key, row);
    }
  }

  return [...rows.values()].sort((a, b) => b.exp - a.exp || a.name.localeCompare(b.name));
}

export type SessionExpSummaryProps = {
  session: PlaySessionDetail;
  reveal: boolean;
};

/** Ringkasan EXP per pemain dalam satu sesi (halaman publik `/sesi/[id]`). */
export function SessionExpSummary({ session, reveal }: SessionExpSummaryProps) {
  const rows = buildRows(session, reveal);

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
        Belum ada game tercatat di sesi ini.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-lg border border-border bg-surface">
      {rows.map((row, index) => (
        <li key={row.key} className="flex items-center gap-4 px-4 py-3">
          <span
            className={cn(
              "w-6 shrink-0 text-right font-display text-lg tabular-nums",
              index < 3 ? "text-primary" : "text-text-subtle",
            )}
          >
            {index + 1}
          </span>
          <MemberAvatar name={row.name} avatarKey={row.avatarKey} avatarUrl={row.avatarUrl} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-text">
              {row.name}
              {row.isMember ? null : (
                <span className="ml-2 text-[10px] tracking-[0.04em] text-text-muted">
                  BaturanNgabinton
                </span>
              )}
            </p>
            <p className="text-xs text-text-muted">
              {row.games} game · {row.setsWon}/{row.setsPlayed} set
            </p>
          </div>
          <span className="shrink-0 font-display text-lg tabular-nums text-primary">
            +{row.exp}
          </span>
        </li>
      ))}
    </ol>
  );
}
