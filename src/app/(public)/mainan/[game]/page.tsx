import { ArrowLeft, LogIn, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GameFrame } from "@/components/game/game-frame";
import { PongOnlineLobby } from "@/components/game/pong-online-lobby";
import { Container } from "@/components/layout/container";
import { getCurrentUser } from "@/lib/auth/guards";
import { getGame } from "@/lib/games/catalog";

export const revalidate = 0;

type PageProps = {
  params: Promise<{ game: string }>;
  searchParams: Promise<{ room?: string; role?: string; play?: string }>;
};

const ROOM_PATTERN = /^[A-Z0-9]{4,12}$/;

/** Pembeda cache aset game saat isi `public/games/*.html` diperbarui. */
const GAME_ASSET_VERSION = "20261021-5";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { game } = await params;
  const info = getGame(game);
  if (!info) return { title: "Game tidak ditemukan — NGABINTON" };
  return {
    title: `${info.title} — Pang-Jagona NGABINTON`,
    description: info.tagline,
  };
}

/** Halaman satu mini-game. Game Pong menampilkan panel tanding online. */
export default async function GamePage({ params, searchParams }: PageProps) {
  const [{ game }, query] = await Promise.all([params, searchParams]);
  const info = getGame(game);
  if (!info) notFound();

  const user = await getCurrentUser();

  const code = (query.room ?? "").trim().toUpperCase();
  const role: "host" | "guest" | null =
    query.role === "host" || query.role === "guest" ? query.role : null;
  const room = info.online && role && ROOM_PATTERN.test(code) ? { code, role } : null;
  const localTwoPlayer = info.online && !room && query.play === "2p";

  const frameParams = new URLSearchParams({ v: GAME_ASSET_VERSION });
  if (room) {
    frameParams.set("room", room.code);
    frameParams.set("role", room.role);
  }
  if (localTwoPlayer) frameParams.set("play", "2p");
  const src = `${info.asset}?${frameParams.toString()}`;

  return (
    <div className="pb-20 pt-24 sm:pt-28">
      <Container size="md">
        <Link
          href="/mainan"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted transition hover:text-text"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Arena Mainan
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl leading-none text-text sm:text-5xl">
              {info.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-text-muted">{info.tagline}</p>
          </div>
          <Link
            href="/mainan#pang-jagona"
            className="inline-flex items-center gap-1.5 rounded-pill border border-border px-3 py-1 text-xs text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <Trophy aria-hidden className="h-3.5 w-3.5 text-primary" />
            Pang-Jagona
          </Link>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <dt className="text-[10px] uppercase tracking-[0.08em] text-text-subtle">
              Level
            </dt>
            <dd className="mt-1 text-sm font-semibold text-text">{info.level}</dd>
          </div>
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <dt className="text-[10px] uppercase tracking-[0.08em] text-text-subtle">
              Kontrol
            </dt>
            <dd className="mt-1 text-sm text-text-secondary">{info.controls}</dd>
          </div>
        </dl>

        {!user ? (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            <LogIn aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <span>
              Mode pengunjung: kamu tetap bisa main, tapi skor baru masuk
              Pang-Jagona setelah{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                login
              </Link>
              .
            </span>
          </p>
        ) : null}

        {info.online && !room ? (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-subtle">
            <span>Mode lokal:</span>
            <Link
              href={localTwoPlayer ? "/mainan/pong-ngabinton" : "/mainan/pong-ngabinton?play=2p"}
              className="rounded-pill border border-border px-3 py-1 font-semibold text-text-muted transition hover:bg-surface-hover hover:text-text"
            >
              {localTwoPlayer ? "Lawan CPU (1 pemain)" : "2 pemain, satu perangkat"}
            </Link>
          </p>
        ) : null}

        {info.online ? (
          <div className="mt-6">
            <PongOnlineLobby roomCode={room?.code ?? null} role={room?.role ?? null} />
          </div>
        ) : null}

        <div className="mt-6">
          <GameFrame src={src} title={`${info.title} — NGABINTON`} />
        </div>

        {info.online ? (
          <p className="mx-auto mt-4 max-w-[460px] text-xs leading-relaxed text-text-subtle">
            Tanpa kode room, game berjalan melawan CPU. Kemenangan hanya masuk
            peringkat Pong bila dimainkan lewat tanding online.
          </p>
        ) : null}
      </Container>
    </div>
  );
}
