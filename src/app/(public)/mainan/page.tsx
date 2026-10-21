import { LogIn, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { GameCard } from "@/components/game/game-card";
import { PangJagonaPanel } from "@/components/game/pang-jagona-panel";
import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";
import {
  getGameLeaderboard,
  getPongHistory,
  getPongLeaderboard,
  type GameLeaderboardRow,
} from "@/lib/api/games";
import { getCurrentUser } from "@/lib/auth/guards";
import { GAMES, type GameSlug } from "@/lib/games/catalog";
import { maskName } from "@/lib/members/name";

export const metadata: Metadata = {
  title: "Arena Mainan & Pang-Jagona — NGABINTON",
  description:
    "Empat mini-game NGABINTON: Flappy Badminton, Pelari Kalcer, Pong Ngabinton, dan Pukul Aku Pukul Aku. Main di ponsel atau PC, masuk Pang-Jagona dengan login.",
};

export const revalidate = 0;

function toLeader(
  row: { nickname: string | null; displayName: string } | undefined,
  value: number | undefined,
  reveal: boolean,
): { label: string; value: number } | null {
  if (!row || value === undefined) return null;
  const raw = row.nickname?.trim() || row.displayName;
  return { label: reveal ? raw : maskName(raw), value };
}

/**
 * Sensor data sebelum dikirim ke komponen client: nama lengkap tidak boleh
 * ikut terserialisasi di RSC payload untuk pengunjung.
 */
function anonymizeRows<T extends { nickname: string | null; displayName: string; username: string }>(
  rows: T[],
): T[] {
  return rows.map((row) => ({
    ...row,
    username: "",
    nickname: null,
    displayName: maskName(row.nickname?.trim() || row.displayName),
  }));
}

/** Arena Mainan: daftar game + Pang-Jagona. */
export default async function MainanPage() {
  const user = await getCurrentUser();
  const reveal = Boolean(user);

  // Query berurutan: pool `postgres` dibatasi 5 koneksi (M14-08 / M15-04).
  const flappy = await getGameLeaderboard("flappy-badminton");
  const pelari = await getGameLeaderboard("pelari-kalcer");
  const pukul = await getGameLeaderboard("pukul-aku-pukul-aku");
  const pongLeaderboard = await getPongLeaderboard();
  const pongHistory = await getPongHistory();

  const boards: Record<GameSlug, GameLeaderboardRow[]> = {
    "flappy-badminton": reveal ? flappy : anonymizeRows(flappy),
    "pelari-kalcer": reveal ? pelari : anonymizeRows(pelari),
    "pong-ngabinton": [],
    "pukul-aku-pukul-aku": reveal ? pukul : anonymizeRows(pukul),
  };

  const pongBoardRows = reveal ? pongLeaderboard : anonymizeRows(pongLeaderboard);
  const historyRows = reveal
    ? pongHistory
    : pongHistory.map((row) => ({
        ...row,
        hostName: maskName(row.hostName),
        guestName: maskName(row.guestName),
      }));

  const leaders: Record<GameSlug, { label: string; value: number } | null> = {
    "flappy-badminton": toLeader(flappy[0], flappy[0]?.best, reveal),
    "pelari-kalcer": toLeader(pelari[0], pelari[0]?.best, reveal),
    "pong-ngabinton": toLeader(pongLeaderboard[0], pongLeaderboard[0]?.wins, reveal),
    "pukul-aku-pukul-aku": toLeader(pukul[0], pukul[0]?.best, reveal),
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-background-elevated">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/10 via-background-elevated to-background-elevated"
        />
        <Container size="xl" className="relative pb-16 pt-24 sm:pb-20 sm:pt-28">
          <p className="inline-flex items-center gap-2 rounded-pill border border-border px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-text-muted">
            <Trophy aria-hidden className="h-3.5 w-3.5 text-primary" />
            Pang-Jagona
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] text-text sm:text-6xl lg:text-7xl">
            Arena Mainan
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
            Empat permainan ringan untuk mengisi waktu sebelum atau sesudah mabar.
            Semua bisa dimainkan langsung dari ponsel maupun PC. Skor anggota yang
            login otomatis masuk papan peringkat Pang-Jagona.
          </p>

          {!user ? (
            <div className="mt-7 flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-sm text-text-muted">
                <LogIn aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                Kamu main sebagai pengunjung. Login dulu supaya skor dan hasil
                tanding tercatat di Pang-Jagona.
              </p>
              <Link href="/login" className={buttonClass("primary", "sm", "shrink-0")}>
                Masuk
              </Link>
            </div>
          ) : null}
        </Container>
      </section>

      <Container size="xl" className="py-12 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {GAMES.map((game) => (
            <GameCard key={game.slug} game={game} leader={leaders[game.slug]} />
          ))}
        </div>
      </Container>

      <Container size="lg" className="pb-16 sm:pb-20">
        <section id="pang-jagona" className="scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-4xl leading-none text-text sm:text-5xl">
                Pang-Jagona
              </h2>
              <p className="mt-2 max-w-xl text-sm text-text-muted">
                Peringkat skor terbaik all-time per game. Khusus Pong Ngabinton,
                peringkat dihitung dari kemenangan tanding online, lengkap dengan
                riwayat tanding.
              </p>
            </div>
            {!reveal ? (
              <p className="text-xs text-text-subtle">Nama disensor untuk pengunjung.</p>
            ) : null}
          </div>

          <div className="mt-5">
            <PangJagonaPanel
              games={GAMES}
              boards={boards}
              pongLeaderboard={pongBoardRows}
              pongHistory={historyRows}
              reveal={reveal}
            />
          </div>
        </section>
      </Container>
    </>
  );
}
