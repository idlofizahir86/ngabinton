/**
 * Query baca untuk sesi bermain, game, peserta, dan daftar anggota.
 * Semua akses DB baca lewat `lib/api/` (ARCHITECTURE.md §2).
 */
import { and, asc, count, desc, eq, gte, isNull, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { matchParticipants, matches, matchSets, playSessions, users } from "@/lib/db/schema";

/** Sesi bermain + jumlah game (opsional difilter rentang tanggal). */
export async function getPlaySessions(from?: Date, to?: Date) {
  const conditions = [];
  if (from) conditions.push(gte(playSessions.playedAt, from));
  if (to) conditions.push(lt(playSessions.playedAt, to));

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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(playSessions.id)
    .orderBy(desc(playSessions.playedAt));
}

/** Bulan-bulan (YYYY-MM) yang punya sesi bermain. */
export async function getPlaySessionPeriodKeys(): Promise<string[]> {
  const rows = await db
    .select({
      key: sql<string>`to_char(${playSessions.playedAt} at time zone 'Asia/Jakarta', 'YYYY-MM')`,
    })
    .from(playSessions)
    .groupBy(sql`1`)
    .orderBy(sql`1 desc`);

  return rows.map((row) => row.key);
}

export type PlaySessionSummary = Awaited<ReturnType<typeof getPlaySessions>>[number];

/** Detail satu sesi: game + peserta + set + RSVP (SCHEMA.md §5). */
export async function getPlaySessionById(id: string) {
  const session = await db.query.playSessions.findFirst({
    where: eq(playSessions.id, id),
    with: {
      matches: {
        orderBy: [asc(matches.order)],
        with: {
          participants: {
            orderBy: [asc(matchParticipants.createdAt)],
            with: {
              user: {
                columns: {
                  id: true,
                  username: true,
                  displayName: true,
                  nickname: true,
                  avatarKey: true,
                  avatarUrl: true,
                },
              },
            },
          },
          sets: { orderBy: [asc(matchSets.setNumber)] },
        },
      },
      rsvps: {
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              nickname: true,
              avatarKey: true,
              avatarUrl: true,
            },
          },
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

/** Daftar BaturanNgabinton yang pernah main & belum jadi anggota. */
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

/** Sesi bermain mendatang + daftar RSVP (untuk halaman utama). */
export async function getUpcomingPlaySessions(limit: number = 5) {
  return db.query.playSessions.findMany({
    where: gte(playSessions.playedAt, new Date()),
    orderBy: [asc(playSessions.playedAt)],
    limit,
    with: {
      rsvps: {
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              nickname: true,
              avatarKey: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });
}

export type UpcomingSession = Awaited<ReturnType<typeof getUpcomingPlaySessions>>[number];
export type SessionRsvpWithUser = UpcomingSession["rsvps"][number];
