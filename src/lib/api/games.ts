/**
 * Akses data mini-game Pang-Jagona (SCHEMA.md §3.13–§3.15).
 *
 * Skor & hasil tanding hanya dicatat untuk pemain yang login. Room Pong
 * menyimpan SDP WebRTC supaya dua pemain bisa terhubung tanpa server realtime
 * pihak ketiga (`ARCHITECTURE.md` ADR-009).
 */
import { randomInt } from "node:crypto";

import { and, desc, eq, gt, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { gameScores, pongMatches, pongRooms, users } from "@/lib/db/schema";
import type { GameSlug } from "@/lib/games/catalog";
import { DB_READ_TIMEOUT_MS, withTimeout } from "@/lib/utils/timeout";

export type GameLeaderboardRow = {
  userId: number;
  username: string;
  displayName: string;
  nickname: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  best: number;
  plays: number;
};

export type PongLeaderboardRow = Omit<GameLeaderboardRow, "best" | "plays"> & {
  wins: number;
  games: number;
};

export type PongHistoryRow = {
  id: string;
  roomCode: string;
  hostUserId: number | null;
  hostName: string;
  guestUserId: number | null;
  guestName: string;
  hostScore: number;
  guestScore: number;
  winner: string;
  playedAt: Date;
};

export type PongRoom = {
  code: string;
  hostUserId: number | null;
  hostName: string;
  guestUserId: number | null;
  guestName: string | null;
  hostOffer: string | null;
  guestAnswer: string | null;
  status: string;
  expiresAt: Date;
};

/** Batas jumlah baris papan peringkat yang ditampilkan. */
export const GAME_LEADERBOARD_LIMIT = 25;

/** Umur room Pong (menit) sebelum kode kedaluwarsa. */
const PONG_ROOM_TTL_MS = 30 * 60 * 1000;

/** Huruf/angka tanpa karakter ambigu (0/O, 1/I). */
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 6;

function makeRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    code += ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

/** Simpan satu skor game (hanya dipanggil untuk user yang login). */
export async function addGameScore(
  game: GameSlug,
  userId: number,
  score: number,
): Promise<void> {
  await db.insert(gameScores).values({ game, userId, score });
}

/** Peringkat skor tertinggi per anggota untuk satu game. */
export async function getGameLeaderboard(game: GameSlug): Promise<GameLeaderboardRow[]> {
  const best = db
    .select({
      userId: gameScores.userId,
      best: sql<number>`max(${gameScores.score})::int`.as("best"),
      plays: sql<number>`count(*)::int`.as("plays"),
    })
    .from(gameScores)
    .where(eq(gameScores.game, game))
    .groupBy(gameScores.userId)
    .as("best_scores");

  return withTimeout(
    db
      .select({
        userId: users.id,
        username: users.username,
        displayName: users.displayName,
        nickname: users.nickname,
        avatarKey: users.avatarKey,
        avatarUrl: users.avatarUrl,
        best: best.best,
        plays: best.plays,
      })
      .from(best)
      .innerJoin(users, eq(users.id, best.userId))
      .where(eq(users.isActive, true))
      .orderBy(desc(best.best), users.id)
      .limit(GAME_LEADERBOARD_LIMIT),
    DB_READ_TIMEOUT_MS,
  );
}

type PongAggregate = {
  user_id: number;
  wins: number;
  games: number;
};

/** Peringkat Pong online berdasarkan jumlah kemenangan. */
export async function getPongLeaderboard(): Promise<PongLeaderboardRow[]> {
  const aggregate = await withTimeout(
    db.execute<PongAggregate>(sql`
      select u.id as user_id,
             count(m.id)::int as games,
             sum(
               case
                 when (m.winner = 'host' and m.host_user_id = u.id)
                   or (m.winner = 'guest' and m.guest_user_id = u.id)
                 then 1 else 0 end
             )::int as wins
      from ${pongMatches} m
      join ${users} u on u.id = m.host_user_id or u.id = m.guest_user_id
      where u.is_active = true
      group by u.id
      order by wins desc, games asc, u.id asc
      limit ${GAME_LEADERBOARD_LIMIT}
    `),
    DB_READ_TIMEOUT_MS,
  );

  if (aggregate.length === 0) return [];

  const ids = aggregate.map((row) => row.user_id);
  const profiles = await withTimeout(
    db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        nickname: users.nickname,
        avatarKey: users.avatarKey,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(inArray(users.id, ids)),
    DB_READ_TIMEOUT_MS,
  );
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));

  return aggregate.flatMap((row) => {
    const profile = byId.get(row.user_id);
    if (!profile) return [];
    return [
      {
        userId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        nickname: profile.nickname,
        avatarKey: profile.avatarKey,
        avatarUrl: profile.avatarUrl,
        wins: row.wins,
        games: row.games,
      },
    ];
  });
}

/** Riwayat tanding Pong online terbaru. */
export async function getPongHistory(limit = 20): Promise<PongHistoryRow[]> {
  const rows = await withTimeout(
    db
      .select({
        id: pongMatches.id,
        roomCode: pongMatches.roomCode,
        hostUserId: pongMatches.hostUserId,
        hostName: pongMatches.hostName,
        guestUserId: pongMatches.guestUserId,
        guestName: pongMatches.guestName,
        hostScore: pongMatches.hostScore,
        guestScore: pongMatches.guestScore,
        winner: pongMatches.winner,
        playedAt: pongMatches.playedAt,
      })
      .from(pongMatches)
      .orderBy(desc(pongMatches.playedAt))
      .limit(limit),
    DB_READ_TIMEOUT_MS,
  );

  return rows.map((row) => ({ ...row, guestName: row.guestName ?? "Pengunjung" }));
}

/** Buat room Pong baru; kode dijamin unik. */
export async function createPongRoom(
  hostUserId: number | null,
  hostName: string,
): Promise<PongRoom> {
  const expiresAt = new Date(Date.now() + PONG_ROOM_TTL_MS);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeRoomCode();
    const existing = await db
      .select({ code: pongRooms.code })
      .from(pongRooms)
      .where(eq(pongRooms.code, code))
      .limit(1);
    if (existing.length > 0) continue;

    const [room] = await db
      .insert(pongRooms)
      .values({ code, hostUserId, hostName, expiresAt })
      .returning();
    if (room) return room;
  }

  throw new Error("Gagal membuat kode room.");
}

/** Ambil room yang masih berlaku. `null` bila tidak ada / kedaluwarsa. */
export async function getPongRoom(code: string): Promise<PongRoom | null> {
  const rows = await db
    .select()
    .from(pongRooms)
    .where(and(eq(pongRooms.code, code), gt(pongRooms.expiresAt, new Date())))
    .limit(1);

  return rows[0] ?? null;
}

/** Isi kursi tamu. Room yang sudah punya tamu boleh dipakai untuk reconnect. */
export async function joinPongRoom(
  code: string,
  guestUserId: number | null,
  guestName: string,
): Promise<PongRoom | null> {
  const room = await getPongRoom(code);
  if (!room) return null;

  if (!room.guestName) {
    const [updated] = await db
      .update(pongRooms)
      .set({ guestUserId, guestName, status: "ready" })
      .where(eq(pongRooms.code, code))
      .returning();
    return updated ?? room;
  }

  return room;
}

/** Simpan SDP offer dari host. */
export async function setPongOffer(code: string, offer: string): Promise<void> {
  await db.update(pongRooms).set({ hostOffer: offer }).where(eq(pongRooms.code, code));
}

/** Simpan SDP answer dari tamu. */
export async function setPongAnswer(code: string, answer: string): Promise<void> {
  await db.update(pongRooms).set({ guestAnswer: answer }).where(eq(pongRooms.code, code));
}

/** Kosongkan answer lama saat host memulai negosiasi baru (rematch/reload). */
export async function clearPongAnswer(code: string): Promise<void> {
  await db.update(pongRooms).set({ guestAnswer: null }).where(eq(pongRooms.code, code));
}

/**
 * Catat hasil tanding online. Hanya sekali per room (unique `room_code`),
 * identitas pemain diambil dari room agar tamu tanpa akun tidak masuk riwayat.
 */
export async function recordPongMatch(
  code: string,
  hostScore: number,
  guestScore: number,
): Promise<boolean> {
  const room = await getPongRoom(code);
  if (!room || hostScore === guestScore) return false;

  const winner = hostScore > guestScore ? "host" : "guest";
  await db
    .insert(pongMatches)
    .values({
      roomCode: code,
      hostUserId: room.hostUserId,
      hostName: room.hostName,
      guestUserId: room.guestUserId,
      guestName: room.guestName,
      hostScore,
      guestScore,
      winner,
    })
    .onConflictDoNothing({ target: pongMatches.roomCode });

  await db.update(pongRooms).set({ status: "finished" }).where(eq(pongRooms.code, code));
  return true;
}
