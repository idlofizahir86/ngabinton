/**
 * Papan peringkat Pang-Giatna Ngabinton — RULES.md §13.3 & §13.5.
 *
 * Sumber kebenaran tetap tabel permainan. BaturanNgabinton ikut dihitung
 * (tanpa akun), tetapi pencapaiannya tidak ditampilkan sampai jadi anggota.
 */
import { and, asc, eq, gte, isNotNull, lt, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { EXP_LOSS_PER_SET, EXP_WIN_PER_SET } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { matchParticipants, matches, matchSets, playSessions, users } from "@/lib/db/schema";
import type { Period } from "@/lib/utils/period";
import { DB_READ_TIMEOUT_MS, withTimeout } from "@/lib/utils/timeout";

export type StandingStats = {
  sessions: number;
  games: number;
  setsPlayed: number;
  setsWon: number;
};

export type StandingRow = {
  /** `user:<id>` atau `guest:<nama>` — kunci unik untuk pencapaian. */
  key: string;
  kind: "member" | "guest";
  userId: number | null;
  guestName: string | null;
  username: string | null;
  displayName: string;
  nickname: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  exp: number;
  stats: StandingStats;
};

const WIN_CONDITION = sql`(
  (${matchParticipants.side} = 'a' and ${matchSets.scoreA} > ${matchSets.scoreB})
  or (${matchParticipants.side} = 'b' and ${matchSets.scoreB} > ${matchSets.scoreA})
)`;

type RawStanding = {
  userId: number | null;
  guestName: string | null;
  displayName: string;
  exp: number;
  sessions: number;
  games: number;
  setsPlayed: number;
  setsWon: number;
};

async function getRawStandings(from?: Date, to?: Date): Promise<RawStanding[]> {
  const conditions = [];
  if (from) conditions.push(gte(playSessions.playedAt, from));
  if (to) conditions.push(lt(playSessions.playedAt, to));
  conditions.push(
    or(isNotNull(matchParticipants.userId), isNotNull(matchParticipants.guestName))!,
  );

  return db
    .select({
      userId: matchParticipants.userId,
      guestName: matchParticipants.guestName,
      displayName: sql<string>`max(${matchParticipants.displayName})`,
      exp: sql<number>`coalesce(sum(case when ${WIN_CONDITION} then ${EXP_WIN_PER_SET}::int else ${EXP_LOSS_PER_SET}::int end), 0)::int`,
      sessions: sql<number>`count(distinct ${playSessions.id})::int`,
      games: sql<number>`count(distinct ${matches.id})::int`,
      setsPlayed: sql<number>`count(${matchSets.id})::int`,
      setsWon: sql<number>`coalesce(sum(case when ${WIN_CONDITION} then 1 else 0 end), 0)::int`,
    })
    .from(matchParticipants)
    .innerJoin(matches, eq(matches.id, matchParticipants.matchId))
    .innerJoin(playSessions, eq(playSessions.id, matches.sessionId))
    .innerJoin(matchSets, eq(matchSets.matchId, matches.id))
    .where(and(...conditions))
    .groupBy(matchParticipants.userId, matchParticipants.guestName);
}

/** Semua peserta (anggota aktif + BaturanNgabinton), urut EXP menurun. */
async function getStandingsUncached(from?: Date, to?: Date): Promise<StandingRow[]> {
  const [raw, profiles] = await withTimeout(
    Promise.all([
      getRawStandings(from, to),
      db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          nickname: users.nickname,
          avatarKey: users.avatarKey,
          avatarUrl: users.avatarUrl,
          role: users.role,
          isActive: users.isActive,
        })
        .from(users)
        .orderBy(asc(users.displayName)),
    ]),
    DB_READ_TIMEOUT_MS,
  );

  const byId = new Map(profiles.map((profile) => [profile.id, profile]));

  const rows: StandingRow[] = [];
  for (const item of raw) {
    if (item.userId) {
      const profile = byId.get(item.userId);
      // Pang-Giatna hanya untuk anggota club aktif (RULES.md §13.3).
      if (!profile || profile.role !== "member" || !profile.isActive) continue;
      rows.push({
        key: `user:${profile.id}`,
        kind: "member",
        userId: profile.id,
        guestName: null,
        username: profile.username,
        displayName: profile.displayName,
        nickname: profile.nickname,
        avatarKey: profile.avatarKey,
        avatarUrl: profile.avatarUrl,
        exp: item.exp,
        stats: {
          sessions: item.sessions,
          games: item.games,
          setsPlayed: item.setsPlayed,
          setsWon: item.setsWon,
        },
      });
      continue;
    }

    if (!item.guestName) continue;
    rows.push({
      key: `guest:${item.guestName}`,
      kind: "guest",
      userId: null,
      guestName: item.guestName,
      username: null,
      displayName: item.guestName,
      nickname: null,
      avatarKey: null,
      avatarUrl: null,
      exp: item.exp,
      stats: {
        sessions: item.sessions,
        games: item.games,
        setsPlayed: item.setsPlayed,
        setsWon: item.setsWon,
      },
    });
  }

  return rows.sort((a, b) => {
    if (b.exp !== a.exp) return b.exp - a.exp;
    if (b.stats.games !== a.stats.games) return b.stats.games - a.stats.games;
    return a.displayName.localeCompare(b.displayName, "id");
  });
}

/**
 * Papan peringkat all-time di-cache 60 detik (tag `rankings`) karena dipakai
 * banyak halaman (`/member`, `/leaderboard`, profil publik) dan isinya sama
 * untuk semua pengunjung.
 */
const getStandingsCached = unstable_cache(getStandingsUncached, ["standings-all-time"], {
  revalidate: 60,
  tags: ["rankings"],
});

/** Semua peserta (anggota aktif + BaturanNgabinton), urut EXP menurun. */
export async function getStandings(from?: Date, to?: Date): Promise<StandingRow[]> {
  if (from || to) return getStandingsUncached(from, to);
  return getStandingsCached();
}

/** Peringkat 1-based dari daftar standings (hindari query ulang). */
export function rankFromStandings(rows: StandingRow[], userId: number): number {
  const index = rows.findIndex((row) => row.userId === userId);
  return index >= 0 ? index + 1 : rows.length + 1;
}

/** Peringkat bulanan. */
export async function getMonthlyStandings(period: Period): Promise<StandingRow[]> {
  return getStandings(period.start, period.end);
}

/** Jumlah game yang tercatat dalam satu periode. */
export async function countMatchesInPeriod(period: Period): Promise<number> {
  const rows = await db
    .select({ total: sql<number>`count(${matches.id})::int` })
    .from(matches)
    .innerJoin(playSessions, eq(playSessions.id, matches.sessionId))
    .where(and(gte(playSessions.playedAt, period.start), lt(playSessions.playedAt, period.end)));

  return rows[0]?.total ?? 0;
}

/** Daftar `YYYY-MM` yang punya sesi bermain (untuk finalisasi pencapaian). */
export async function getPlayedPeriodKeys(): Promise<string[]> {
  const rows = await db
    .select({
      key: sql<string>`to_char(${playSessions.playedAt} at time zone 'Asia/Jakarta', 'YYYY-MM')`,
    })
    .from(playSessions)
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  return rows.map((row) => row.key);
}
