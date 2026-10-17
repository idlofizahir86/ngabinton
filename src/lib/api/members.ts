/**
 * Query baca untuk anggota club: leaderboard, statistik, dan riwayat main.
 */
import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { matchParticipants, matches, matchSets, playSessions, users } from "@/lib/db/schema";
import { summarizeSets } from "@/lib/api/exp";
import { getStandings, rankFromStandings, type StandingRow } from "@/lib/api/rankings";
import type { MatchSide } from "@/lib/constants";

/** Statistik permainan seorang anggota. */
export type MemberStats = {
  games: number;
  setsPlayed: number;
  setsWon: number;
};

const STAT_SELECT = {
  userId: matchParticipants.userId,
  games: sql<number>`count(distinct ${matchParticipants.matchId})::int`,
  setsPlayed: sql<number>`count(${matchSets.id})::int`,
  setsWon: sql<number>`coalesce(sum(case
    when (${matchParticipants.side} = 'a' and ${matchSets.scoreA} > ${matchSets.scoreB})
      or (${matchParticipants.side} = 'b' and ${matchSets.scoreB} > ${matchSets.scoreA})
    then 1 else 0 end), 0)::int`,
};

/** Baris leaderboard: anggota/BaturanNgabinton + statistik. */
export type LeaderboardRow = StandingRow;

/**
 * Leaderboard ("Pang-Giatna Ngabinton") all-time.
 * Anggota aktif + BaturanNgabinton, urut EXP menurun (RULES.md §13.3).
 */
export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  return getStandings();
}

/** Statistik satu anggota. */
export async function getMemberStats(userId: number): Promise<MemberStats> {
  const rows = await db
    .select(STAT_SELECT)
    .from(matchParticipants)
    .innerJoin(matchSets, eq(matchSets.matchId, matchParticipants.matchId))
    .where(eq(matchParticipants.userId, userId))
    .groupBy(matchParticipants.userId);

  const row = rows[0];
  return { games: row?.games ?? 0, setsPlayed: row?.setsPlayed ?? 0, setsWon: row?.setsWon ?? 0 };
}

/** Peringkat anggota (1-based) pada Pang-Giatna all-time. */
export async function getMemberRank(userId: number): Promise<number> {
  return rankFromStandings(await getStandings(), userId);
}

/** Ringkasan satu peserta dalam sebuah game. */
export type ParticipantBrief = {
  userId: number | null;
  name: string;
  avatarKey: string | null;
};

/** Satu set dalam riwayat: skor sisi pemilik + hasil. */
export type HistorySet = {
  scoreUs: number;
  scoreThem: number;
  won: boolean;
};

/** Satu game dalam riwayat main seorang anggota. */
export type HistoryEntry = {
  matchId: string;
  sessionTitle: string;
  playedAt: Date;
  label: string | null;
  side: MatchSide;
  teammates: ParticipantBrief[];
  opponents: ParticipantBrief[];
  sets: HistorySet[];
  expGained: number;
  result: "win" | "loss";
};

const HISTORY_LIMIT = 30;

export type HistoryFilters = {
  from?: Date;
  to?: Date;
  limit?: number;
};

/** Riwayat main seorang anggota (terbaru dulu), opsional difilter rentang tanggal. */
export async function getMemberHistory(
  userId: number,
  filters: HistoryFilters = {},
): Promise<HistoryEntry[]> {
  const conditions = [eq(matchParticipants.userId, userId)];

  if (filters.from || filters.to) {
    const sessionConditions = [];
    if (filters.from) sessionConditions.push(gte(playSessions.playedAt, filters.from));
    if (filters.to) sessionConditions.push(lt(playSessions.playedAt, filters.to));

    const matchIds = db
      .select({ id: matches.id })
      .from(matches)
      .innerJoin(playSessions, eq(playSessions.id, matches.sessionId))
      .where(and(...sessionConditions));

    conditions.push(inArray(matchParticipants.matchId, matchIds));
  }

  const rows = await db.query.matchParticipants.findMany({
    where: and(...conditions),
    orderBy: [desc(matchParticipants.createdAt)],
    limit: filters.limit ?? HISTORY_LIMIT,
    with: {
      match: {
        with: {
          session: true,
          participants: true,
          sets: { orderBy: [asc(matchSets.setNumber)] },
        },
      },
    },
  });

  return rows.map((row) => {
    const side = row.side;
    const all = row.match.participants;
    const mapBrief = (p: (typeof all)[number]): ParticipantBrief => ({
      userId: p.userId,
      name: p.displayName,
      avatarKey: null,
    });

    const teammates = all.filter((p) => p.side === side && p.id !== row.id).map(mapBrief);
    const opponents = all.filter((p) => p.side !== side).map(mapBrief);

    const sets: HistorySet[] = row.match.sets.map((set) => {
      const us = side === "a" ? set.scoreA : set.scoreB;
      const them = side === "a" ? set.scoreB : set.scoreA;
      return { scoreUs: us, scoreThem: them, won: us > them };
    });

    const summary = summarizeSets(row.match.sets);
    const expGained = side === "a" ? summary.expA : summary.expB;
    const winsUs = side === "a" ? summary.winsA : summary.winsB;
    const winsThem = side === "a" ? summary.winsB : summary.winsA;

    return {
      matchId: row.match.id,
      sessionTitle: row.match.session.title,
      playedAt: row.match.session.playedAt,
      label: row.match.label,
      side,
      teammates,
      opponents,
      sets,
      expGained,
      result: winsUs >= winsThem ? "win" : "loss",
    };
  });
}

/** Bulan-bulan (YYYY-MM) saat anggota punya riwayat main. */
export async function getMemberPeriodKeys(userId: number): Promise<string[]> {
  const rows = await db
    .select({
      key: sql<string>`to_char(${playSessions.playedAt} at time zone 'Asia/Jakarta', 'YYYY-MM')`,
    })
    .from(matchParticipants)
    .innerJoin(matches, eq(matches.id, matchParticipants.matchId))
    .innerJoin(playSessions, eq(playSessions.id, matches.sessionId))
    .where(eq(matchParticipants.userId, userId))
    .groupBy(sql`1`)
    .orderBy(sql`1 desc`);

  return rows.map((row) => row.key);
}

/** Baris daftar anggota (admin): termasuk kontak & status aktif. */
export type AdminMemberRow = {
  id: number;
  username: string;
  displayName: string;
  nickname: string | null;
  waNumber: string | null;
  email: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  exp: number;
  isActive: boolean;
};

const ADMIN_MEMBER_COLUMNS = {
  id: users.id,
  username: users.username,
  displayName: users.displayName,
  nickname: users.nickname,
  waNumber: users.waNumber,
  email: users.email,
  avatarKey: users.avatarKey,
  avatarUrl: users.avatarUrl,
  exp: users.exp,
  isActive: users.isActive,
} as const;

/** Semua anggota club (aktif & nonaktif) untuk halaman admin. */
export async function getAllMembers(): Promise<AdminMemberRow[]> {
  return db
    .select(ADMIN_MEMBER_COLUMNS)
    .from(users)
    .where(eq(users.role, "member"))
    .orderBy(desc(users.isActive), asc(users.displayName));
}

/** Profil anggota publik berdasarkan username (`/u/[username]`). */
export async function getMemberByUsername(username: string) {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      nickname: users.nickname,
      avatarKey: users.avatarKey,
      avatarUrl: users.avatarUrl,
      exp: users.exp,
    })
    .from(users)
    .where(and(eq(users.username, username), eq(users.role, "member"), eq(users.isActive, true)))
    .limit(1);

  return rows[0] ?? null;
}

/** Satu anggota berdasarkan id (untuk halaman edit admin). `null` kalau bukan anggota. */
export async function getMemberById(id: number): Promise<AdminMemberRow | null> {
  const rows = await db
    .select(ADMIN_MEMBER_COLUMNS)
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, "member")))
    .limit(1);

  return rows[0] ?? null;
}
