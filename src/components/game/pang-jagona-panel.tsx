"use client";

import { History, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { MemberAvatar } from "@/components/member/member-avatar";
import type {
  GameLeaderboardRow,
  PongHistoryRow,
  PongLeaderboardRow,
} from "@/lib/api/games";
import type { GameInfo, GameSlug } from "@/lib/games/catalog";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";

export type PangJagonaPanelProps = {
  games: readonly GameInfo[];
  boards: Record<GameSlug, GameLeaderboardRow[]>;
  pongLeaderboard: PongLeaderboardRow[];
  pongHistory: PongHistoryRow[];
  /** `true` bila viewer login (nama lengkap); pengunjung melihat nama disensor. */
  reveal: boolean;
};

function displayName(
  row: { nickname: string | null; displayName: string },
  _reveal: boolean,
): string {
  return row.nickname?.trim() || row.displayName;
}

function EmptyBoard({ hasRows, reveal }: { hasRows: boolean; reveal: boolean }) {
  return (
    <div className="px-5 py-10 text-center">
      <Trophy aria-hidden className="mx-auto h-6 w-6 text-text-subtle" />
      <p className="mt-3 text-sm font-semibold text-text">
        {hasRows ? "Belum ada yang bisa ditampilkan" : "Pang-Jagona masih kosong"}
      </p>
      <p className="mt-1 text-sm text-text-muted">
        {reveal
          ? "Jadilah yang pertama mencetak skor di game ini."
          : "Login dan mainkan game ini untuk mengisi papan peringkat."}
      </p>
      {!reveal ? (
        <Link
          href="/login"
          className="mt-4 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Masuk untuk ikut bertanding
        </Link>
      ) : null}
    </div>
  );
}

function ScoreBoard({
  game,
  rows,
  reveal,
}: {
  game: GameInfo;
  rows: GameLeaderboardRow[];
  reveal: boolean;
}) {
  if (rows.length === 0) return <EmptyBoard hasRows={false} reveal={reveal} />;

  return (
    <ol className="divide-y divide-border">
      {rows.map((row, index) => (
        <li key={row.userId} className="flex items-center gap-3 px-4 py-3 sm:px-5">
          <span
            className={cn(
              "w-7 shrink-0 text-right font-display text-xl tabular-nums",
              index < 3 ? "text-primary" : "text-text-subtle",
            )}
          >
            {index + 1}
          </span>
          <MemberAvatar
            name={row.nickname || row.displayName}
            avatarKey={row.avatarKey}
            avatarUrl={row.avatarUrl}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            {reveal ? (
              <Link
                href={`/u/${row.username}`}
                className="truncate font-semibold text-text underline-offset-4 hover:underline"
              >
                {displayName(row, reveal)}
              </Link>
            ) : (
              <p className="truncate font-semibold text-text">{displayName(row, reveal)}</p>
            )}
            <p className="text-xs text-text-muted">
              {row.plays > 1 ? `${row.plays} percobaan` : "1 percobaan"}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-xl tabular-nums text-text">
              {row.best.toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] uppercase tracking-[0.04em] text-text-muted">
              {game.scoreLabel}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function PongBoard({
  rows,
  reveal,
}: {
  rows: PongLeaderboardRow[];
  reveal: boolean;
}) {
  if (rows.length === 0) return <EmptyBoard hasRows={false} reveal={reveal} />;

  return (
    <ol className="divide-y divide-border">
      {rows.map((row, index) => (
        <li key={row.userId} className="flex items-center gap-3 px-4 py-3 sm:px-5">
          <span
            className={cn(
              "w-7 shrink-0 text-right font-display text-xl tabular-nums",
              index < 3 ? "text-primary" : "text-text-subtle",
            )}
          >
            {index + 1}
          </span>
          <MemberAvatar
            name={row.nickname || row.displayName}
            avatarKey={row.avatarKey}
            avatarUrl={row.avatarUrl}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            {reveal ? (
              <Link
                href={`/u/${row.username}`}
                className="truncate font-semibold text-text underline-offset-4 hover:underline"
              >
                {displayName(row, reveal)}
              </Link>
            ) : (
              <p className="truncate font-semibold text-text">{displayName(row, reveal)}</p>
            )}
            <p className="text-xs text-text-muted">{row.games} tanding online</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-xl tabular-nums text-text">{row.wins}</p>
            <p className="text-[10px] uppercase tracking-[0.04em] text-text-muted">
              Kemenangan
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function PongHistory({ rows, reveal }: { rows: PongHistoryRow[]; reveal: boolean }) {
  if (rows.length === 0) return <EmptyBoard hasRows={false} reveal={reveal} />;

  return (
    <ol className="divide-y divide-border">
      {rows.map((row) => {
        const host = row.hostName;
        const guest = row.guestName;
        const hostWon = row.winner === "host";
        return (
          <li key={row.id} className="px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm text-text">
                <span className={cn("font-semibold", hostWon && "text-primary")}>{host}</span>
                <span className="mx-2 text-text-subtle">vs</span>
                <span className={cn("font-semibold", !hostWon && "text-primary")}>{guest}</span>
              </p>
              <p className="shrink-0 font-display text-lg tabular-nums text-text">
                {row.hostScore} : {row.guestScore}
              </p>
            </div>
            <p className="mt-1 text-xs text-text-subtle">
              {formatDateTime(row.playedAt)} · Room {row.roomCode}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/** Pang-Jagona: papan peringkat per game + Riwayat Tanding Pong. */
export function PangJagonaPanel({
  games,
  boards,
  pongLeaderboard,
  pongHistory,
  reveal,
}: PangJagonaPanelProps) {
  const [active, setActive] = useState<GameSlug>(games[0]?.slug ?? "flappy-badminton");
  const [pongTab, setPongTab] = useState<"board" | "history">("board");
  const game = games.find((item) => item.slug === active) ?? games[0];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex gap-1 overflow-x-auto border-b border-border p-2" role="tablist">
        {games.map((item) => (
          <button
            key={item.slug}
            type="button"
            role="tab"
            aria-selected={active === item.slug}
            onClick={() => {
              setActive(item.slug);
              if (item.slug === "pong-ngabinton") setPongTab("board");
            }}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition duration-150 ease-brand",
              active === item.slug
                ? "bg-primary text-on-primary"
                : "text-text-muted hover:bg-surface-hover hover:text-text",
            )}
          >
            {item.title}
          </button>
        ))}
      </div>

      {game ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
            <p className="text-xs uppercase tracking-[0.08em] text-text-subtle">
              {game.slug === "pong-ngabinton"
                ? "Peringkat kemenangan online"
                : `Peringkat ${game.scoreLabel.toLowerCase()}`}
            </p>
            {game.online ? (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPongTab("board")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-semibold transition",
                    pongTab === "board"
                      ? "bg-surface-hover text-text"
                      : "text-text-subtle hover:text-text",
                  )}
                >
                  <Trophy aria-hidden className="h-3.5 w-3.5" />
                  Peringkat
                </button>
                <button
                  type="button"
                  onClick={() => setPongTab("history")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-semibold transition",
                    pongTab === "history"
                      ? "bg-surface-hover text-text"
                      : "text-text-subtle hover:text-text",
                  )}
                >
                  <History aria-hidden className="h-3.5 w-3.5" />
                  Riwayat Tanding
                </button>
              </div>
            ) : null}
          </div>

          {game.slug === "pong-ngabinton" ? (
            pongTab === "history" ? (
              <PongHistory rows={pongHistory} reveal={reveal} />
            ) : (
              <PongBoard rows={pongLeaderboard} reveal={reveal} />
            )
          ) : (
            <ScoreBoard game={game} rows={boards[game.slug]} reveal={reveal} />
          )}
        </div>
      ) : null}
    </div>
  );
}
