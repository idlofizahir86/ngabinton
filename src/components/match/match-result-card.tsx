import type { MatchWithDetails } from "@/lib/api/matches";
import { summarizeSets } from "@/lib/api/exp";
import { EXP_LOSS_PER_SET, EXP_WIN_PER_SET } from "@/lib/constants";
import { maskName, memberLabel } from "@/lib/members/name";

function playerName(participant: MatchWithDetails["participants"][number], reveal: boolean): string {
  if (participant.user) {
    return memberLabel(participant.user, reveal);
  }
  return reveal ? participant.displayName : maskName(participant.displayName);
}

function SidePlayers({
  players,
  reveal,
}: {
  players: MatchWithDetails["participants"];
  reveal: boolean;
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
      {players.map((player, index) => (
        <span key={player.id} className="flex items-center gap-1.5">
          {index > 0 ? <span className="text-text-subtle">&amp;</span> : null}
          <span className={player.userId ? "text-text" : "text-text-muted"}>
            {playerName(player, reveal)}
            {player.userId ? null : <span className="ml-1 text-[10px] uppercase">tamu</span>}
          </span>
        </span>
      ))}
    </p>
  );
}

export type MatchResultCardProps = {
  match: MatchWithDetails;
  /** `true` untuk pengguna yang login (nama lengkap). */
  reveal: boolean;
};

/** Kartu hasil satu game (halaman publik `/sesi/[id]`). */
export function MatchResultCard({ match, reveal }: MatchResultCardProps) {
  const sideA = match.participants.filter((player) => player.side === "a");
  const sideB = match.participants.filter((player) => player.side === "b");
  const summary = summarizeSets(match.sets);

  return (
    <li className="rounded-lg border border-border bg-surface p-4 sm:p-5">
      <p className="text-xs uppercase tracking-[0.04em] text-text-muted">
        Game {match.order}
        {match.label ? ` · ${match.label}` : ""}
      </p>
      {match.notes ? <p className="mt-1 text-sm text-text-secondary">{match.notes}</p> : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <SidePlayers players={sideA} reveal={reveal} />
        <span className="text-center text-xs uppercase tracking-[0.04em] text-text-subtle">vs</span>
        <SidePlayers players={sideB} reveal={reveal} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {match.sets.map((set) => (
          <span key={set.id} className="rounded-md border border-border px-3 py-1 text-sm tabular-nums">
            <span className="text-text-muted">Set {set.setNumber}:</span>{" "}
            <span className={set.scoreA > set.scoreB ? "text-live" : "text-text"}>{set.scoreA}</span>
            <span className="text-text-subtle"> – </span>
            <span className={set.scoreB > set.scoreA ? "text-live" : "text-text"}>{set.scoreB}</span>
          </span>
        ))}
      </div>

      <p className="mt-3 text-xs text-text-muted">
        Set: A {summary.winsA} – B {summary.winsB} · EXP Tim A{" "}
        <span className="text-primary">+{summary.expA}</span> · Tim B{" "}
        <span className="text-primary">+{summary.expB}</span> (menang +{EXP_WIN_PER_SET}, kalah +
        {EXP_LOSS_PER_SET} per set)
      </p>
    </li>
  );
}
