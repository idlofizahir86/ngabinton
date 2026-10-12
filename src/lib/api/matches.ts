/**
 * Query baca untuk sesi bermain, game, peserta, dan daftar anggota.
 * Semua akses DB baca lewat `lib/api/` (ARCHITECTURE.md §2).
 */
import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { matchParticipants, matches, matchSets, playSessions, users } from "@/lib/db/schema";

/** Sesi bermain + jumlah game di dalamnya (untuk daftar admin). */
export async function getPlaySessions() {
  return db
    .select({
      id: playSessions.id,
      title: playSessions.title,
      location: playSessions.location,
      playedAt: playSessions.playedAt,
      endedAt: playSessions.endedAt,
      notes: playSessions.notes,
      matchCount: count(matches.id),
    })
    .from(playSessions)
    .leftJoin(matches, eq(matches.sessionId, playSessions.id))
    .groupBy(playSessions.id)
    .orderBy(desc(playSessions.playedAt));
}

export type PlaySessionSummary = Awaited<ReturnType<typeof getPlaySessions>>[number];

/** Detail satu sesi: game + peserta + set (SCHEMA.md §5). */
export async function getPlaySessionById(id: string) {
  const session = await db.query.playSessions.findFirst({
    where: eq(playSessions.id, id),
    with: {
      matches: {
        orderBy: [asc(matches.order)],
        with: {
          participants: { orderBy: [asc(matchParticipants.createdAt)] },
          sets: { orderBy: [asc(matchSets.setNumber)] },
        },
      },
    },
  });

  return session ?? null;
}

export type PlaySessionDetail = NonNullable<Awaited<ReturnType<typeof getPlaySessionById>>>;
export type MatchWithDetails = PlaySessionDetail["matches"][number];

/** Pilihan anggota club untuk input peserta game: `{ id, label }`. */
export async function getMemberOptions() {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      nickname: users.nickname,
      avatarKey: users.avatarKey,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(and(eq(users.role, "member"), eq(users.isActive, true)))
    .orderBy(asc(users.displayName));

  return rows;
}

export type MemberOption = Awaited<ReturnType<typeof getMemberOptions>>[number];

/** Daftar tamu (baturan) yang pernah main & belum jadi anggota. */
export async function getGuests() {
  return db
    .select({
      guestName: sql<string>`${matchParticipants.guestName}`,
      games: sql<number>`count(distinct ${matchParticipants.matchId})::int`,
      lastPlayed: sql<Date>`max(${matchParticipants.createdAt})`,
    })
    .from(matchParticipants)
    .where(and(isNull(matchParticipants.userId), sql`${matchParticipants.guestName} is not null`))
    .groupBy(matchParticipants.guestName)
    .orderBy(asc(matchParticipants.guestName));
}

export type GuestSummary = Awaited<ReturnType<typeof getGuests>>[number];
