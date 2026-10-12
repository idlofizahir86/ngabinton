import type { HistoryEntry, ParticipantBrief } from "@/lib/api/members";
import { formatDate, formatTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function TeamNames({ players }: { players: ParticipantBrief[] }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {players.map((player, index) => (
        <span key={`${player.name}-${index}`} className="flex items-center gap-1">
          {index > 0 ? <span className="text-text-subtle">&amp;</span> : null}
          <span className="text-text-secondary">{player.name}</span>
        </span>
      ))}
    </span>
  );
}

/** Riwayat main anggota (COMPONENTS.md §7.2). */
export function MatchHistoryList({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="font-semibold text-text">Belum ada riwayat main.</p>
        <p className="mt-2 text-sm text-text-muted">
          Riwayat muncul setelah pengurus mencatat pertandinganmu.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li key={entry.matchId} className="rounded-lg border border-border bg-surface p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.04em] text-text-muted">
                {entry.sessionTitle}
              </p>
              <p className="text-sm text-text-secondary">
                {formatDate(entry.playedAt)} · {formatTime(entry.playedAt)}
                {entry.label ? ` · ${entry.label}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "rounded-pill px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em]",
                  entry.result === "win" ? "bg-live/15 text-live" : "bg-surface-hover text-text-muted",
                )}
              >
                {entry.result === "win" ? "Menang" : "Kalah"}
              </span>
              <span className="font-display text-lg tabular-nums text-primary">
                +{entry.expGained} EXP
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1 text-sm">
            <TeamNames players={entry.teammates} />
            <span className="text-text-subtle">vs</span>
            <TeamNames players={entry.opponents} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {entry.sets.map((set, index) => (
              <span
                key={index}
                className={cn(
                  "rounded-md border px-3 py-1 text-sm tabular-nums",
                  set.won ? "border-live/40 text-live" : "border-border text-text-muted",
                )}
              >
                Set {index + 1}: {set.scoreUs}–{set.scoreThem}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
