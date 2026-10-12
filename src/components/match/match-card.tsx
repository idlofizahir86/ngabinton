import { Trash2 } from "lucide-react";

import { deleteMatchAction } from "@/actions/match";
import { summarizeSets } from "@/lib/api/exp";
import type { MatchWithDetails } from "@/lib/api/matches";
import { EXP_LOSS_PER_SET, EXP_WIN_PER_SET } from "@/lib/constants";

function SidePlayers({
  players,
}: {
  players: MatchWithDetails["participants"];
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
      {players.map((player, index) => (
        <span key={player.id} className="flex items-center gap-1.5">
          {index > 0 ? <span className="text-text-subtle">&amp;</span> : null}
          <span className={player.userId ? "text-text" : "text-text-muted"}>
            {player.displayName}
            {player.userId ? null : <span className="ml-1 text-[10px]">BaturanNgabinton</span>}
          </span>
        </span>
      ))}
    </p>
  );
}

/** Kartu satu game di halaman detail sesi (admin). */
export function MatchCard({ match }: { match: MatchWithDetails }) {
  const sideA = match.participants.filter((player) => player.side === "a");
  const sideB = match.participants.filter((player) => player.side === "b");
  const summary = summarizeSets(match.sets);

  return (
    <li className="rounded-lg border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.04em] text-text-muted">
            Game {match.order}
            {match.label ? ` · ${match.label}` : ""}
          </p>
          {match.notes ? <p className="mt-1 text-sm text-text-secondary">{match.notes}</p> : null}
        </div>
        <form action={deleteMatchAction}>
          <input type="hidden" name="matchId" value={match.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-1 text-xs text-text-muted transition hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" /> Hapus
          </button>
        </form>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <SidePlayers players={sideA} />
        <span className="text-center text-xs uppercase tracking-[0.04em] text-text-subtle">vs</span>
        <SidePlayers players={sideB} />
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
