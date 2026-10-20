/**
 * Query baca untuk sesi bermain, game, peserta, dan daftar anggota.
 * Semua akses DB baca lewat `lib/api/` (ARCHITECTURE.md §2).
 */
import { and, asc, count, desc, eq, gte, isNull, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  matchParticipants,
  matches,
  matchSets,
  playSessions,
  sessionAttendances,
  users,
} from "@/lib/db/schema";
import { DB_READ_TIMEOUT_MS, withTimeout } from "@/lib/utils/timeout";

/** Sesi bermain + jumlah game (opsional difilter rentang tanggal). */
export async function getPlaySessions(from?: Date, to?: Date) {
  const conditions = [];
  if (from) conditions.push(gte(playSessions.playedAt, from));
  if (to) conditions.push(lt(playSessions.playedAt, to));

  return withTimeout(
    db
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
      .orderBy(desc(playSessions.playedAt)),
    DB_READ_TIMEOUT_MS,
  );
}

/** Bulan-bulan (YYYY-MM) yang punya sesi bermain. */
export async function getPlaySessionPeriodKeys(): Promise<string[]> {
  const rows = await withTimeout(
    db
      .select({
        key: sql<string>`to_char(${playSessions.playedAt} at time zone 'Asia/Jakarta', 'YYYY-MM')`,
      })
      .from(playSessions)
      .groupBy(sql`1`)
      .orderBy(sql`1 desc`),
    DB_READ_TIMEOUT_MS,
  );

  return rows.map((row) => row.key);
}

export type PlaySessionSummary = Awaited<ReturnType<typeof getPlaySessions>>[number];

/** Detail satu sesi: game + peserta + set + RSVP (SCHEMA.md §5). */
export async function getPlaySessionById(id: string) {
  const session = await withTimeout(
    db.query.playSessions.findFirst({
    where: eq(playSessions.id, id),
    with: {
      createdByUser: { columns: { id: true, displayName: true, nickname: true } },
      matches: {
        orderBy: [asc(matches.order)],
        with: {
          createdByUser: { columns: { id: true, displayName: true, nickname: true } },
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
    }),
    DB_READ_TIMEOUT_MS,
  );

  return session ?? null;
}

export type PlaySessionDetail = NonNullable<Awaited<ReturnType<typeof getPlaySessionById>>>;
export type MatchWithDetails = PlaySessionDetail["matches"][number];

export type SessionAttendee = {
  /** Kunci unik: `u:{userId}` untuk anggota, `g:{nama}` untuk BaturanNgabinton. */
  key: string;
  userId: number | null;
  guestName: string | null;
  /** Nama tampil (nickname/username anggota, atau nama BaturanNgabinton). */
  name: string;
  username: string | null;
  nickname: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  isGuest: boolean;
  /** Hadir karena tercatat sebagai peserta game di sesi ini. */
  played: boolean;
  /** Baris `session_attendances` bila ditandai manual (null untuk peserta game). */
  attendanceId: string | null;
};

/** Kunci normalisasi nama BaturanNgabinton (tanpa beda huruf besar/kecil). */
export function guestAttendanceKey(guestName: string): string {
  return `g:${guestName.trim().toLowerCase()}`;
}

function attendeeKey(userId: number | null, guestName: string | null): string {
  if (userId !== null) return `u:${userId}`;
  return guestAttendanceKey(guestName ?? "");
}

/**
 * Kehadiran nyata satu sesi: peserta game (anggota & BaturanNgabinton) plus
 * siapa pun yang ditandai pengurus. `RULES.md` §14.2.
 */
export async function getSessionAttendance(sessionId: string): Promise<SessionAttendee[]> {
  const [players, marked] = await withTimeout(
    Promise.all([
    db
      .selectDistinct({
        userId: matchParticipants.userId,
        guestName: matchParticipants.guestName,
        participantName: matchParticipants.displayName,
        username: users.username,
        nickname: users.nickname,
        avatarKey: users.avatarKey,
        avatarUrl: users.avatarUrl,
      })
      .from(matchParticipants)
      .innerJoin(matches, eq(matches.id, matchParticipants.matchId))
      .leftJoin(users, eq(users.id, matchParticipants.userId))
      .where(eq(matches.sessionId, sessionId)),
    db
      .select({
        attendanceId: sessionAttendances.id,
        userId: sessionAttendances.userId,
        guestName: sessionAttendances.guestName,
        username: users.username,
        displayName: users.displayName,
        nickname: users.nickname,
        avatarKey: users.avatarKey,
        avatarUrl: users.avatarUrl,
      })
      .from(sessionAttendances)
      .leftJoin(users, eq(users.id, sessionAttendances.userId))
      .where(eq(sessionAttendances.sessionId, sessionId)),
    ]),
    DB_READ_TIMEOUT_MS,
  );

  const byKey = new Map<string, SessionAttendee>();

  for (const row of marked) {
    const isGuest = row.userId === null;
    const name = isGuest
      ? (row.guestName ?? "BaturanNgabinton")
      : row.nickname?.trim() || row.username || row.displayName || "Anggota";

    byKey.set(attendeeKey(row.userId, row.guestName), {
      key: attendeeKey(row.userId, row.guestName),
      userId: row.userId,
      guestName: row.guestName,
      name,
      username: row.username,
      nickname: row.nickname,
      avatarKey: row.avatarKey,
      avatarUrl: row.avatarUrl,
      isGuest,
      played: false,
      attendanceId: row.attendanceId,
    });
  }

  for (const row of players) {
    const key = attendeeKey(row.userId, row.guestName);
    const existing = byKey.get(key);
    const isGuest = row.userId === null;
    const name = isGuest
      ? existing?.name || row.participantName
      : row.nickname?.trim() || row.username || row.participantName;

    byKey.set(key, {
      key,
      userId: row.userId,
      guestName: row.guestName,
      name,
      username: row.username,
      nickname: row.nickname,
      avatarKey: row.avatarKey,
      avatarUrl: row.avatarUrl,
      isGuest,
      played: true,
      attendanceId: existing?.attendanceId ?? null,
    });
  }

  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Pilihan anggota club untuk input peserta game: `{ id, label }`. */
export async function getMemberOptions() {
  const rows = await withTimeout(
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
      .where(and(eq(users.role, "member"), eq(users.isActive, true)))
      .orderBy(asc(users.displayName)),
    DB_READ_TIMEOUT_MS,
  );

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
  return withTimeout(
    db.query.playSessions.findMany({
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
    }),
    DB_READ_TIMEOUT_MS,
  );
}

export type UpcomingSession = Awaited<ReturnType<typeof getUpcomingPlaySessions>>[number];
export type SessionRsvpWithUser = UpcomingSession["rsvps"][number];
