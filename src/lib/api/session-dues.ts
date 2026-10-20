/**
 * Query iuran sesi berbasis kehadiran (`RULES.md` §16.11–§16.13).
 *
 * Dipisah dari `lib/api/finance.ts` agar file tetap di bawah 300 baris.
 */
import { and, desc, eq, exists, isNotNull, lt, notExists, or, sql } from "drizzle-orm";

import {
  getSessionAttendance,
  guestAttendanceKey,
  type SessionAttendee,
} from "@/lib/api/matches";
import { db } from "@/lib/db/client";
import {
  financeEntries,
  matchParticipants,
  matches,
  playSessions,
  sessionAttendances,
} from "@/lib/db/schema";

export type SessionDuesRow = SessionAttendee & {
  /** Total iuran sesi yang sudah dibayar orang ini. */
  paidAmount: number;
  /** Jumlah baris iuran sesi yang sudah dibayar orang ini. */
  paidCount: number;
};

/**
 * Status iuran tiap orang yang hadir di satu sesi.
 * Yang dihitung hanya transaksi `income` berkategori `iuran_sesi` dengan
 * `payer_user_id` atau `payer_guest_name` terisi.
 */
export async function getSessionDuesStatus(sessionId: string): Promise<SessionDuesRow[]> {
  const [attendees, payments] = await Promise.all([
    getSessionAttendance(sessionId),
    db
      .select({
        payerUserId: financeEntries.payerUserId,
        payerGuestName: financeEntries.payerGuestName,
        paidAmount: sql<number>`coalesce(sum(${financeEntries.amount}), 0)::int`,
        paidCount: sql<number>`count(*)::int`,
      })
      .from(financeEntries)
      .where(
        and(
          eq(financeEntries.playSessionId, sessionId),
          eq(financeEntries.type, "income"),
          eq(financeEntries.category, "iuran_sesi"),
          or(
            isNotNull(financeEntries.payerUserId),
            isNotNull(financeEntries.payerGuestName),
          ),
        ),
      )
      .groupBy(financeEntries.payerUserId, financeEntries.payerGuestName),
  ]);

  const paid = new Map<string, { amount: number; count: number }>();
  for (const row of payments) {
    const key =
      row.payerUserId !== null
        ? `u:${row.payerUserId}`
        : guestAttendanceKey(row.payerGuestName ?? "");
    paid.set(key, { amount: row.paidAmount, count: row.paidCount });
  }

  return attendees.map((attendee) => {
    const payment = paid.get(attendee.key);
    return {
      ...attendee,
      paidAmount: payment?.amount ?? 0,
      paidCount: payment?.count ?? 0,
    };
  });
}

export type MemberUnpaidDues = {
  sessionId: string;
  title: string;
  playedAt: Date;
};

/**
 * Sesi yang sudah lewat di mana anggota tercatat hadir (peserta game atau
 * ditandai pengurus) tapi belum punya iuran sesi.
 */
export async function getMemberUnpaidSessionDues(
  userId: number,
  limit: number = 5,
): Promise<MemberUnpaidDues[]> {
  const attended = or(
    exists(
      db
        .select({ value: sql`1` })
        .from(matchParticipants)
        .innerJoin(matches, eq(matches.id, matchParticipants.matchId))
        .where(and(eq(matches.sessionId, playSessions.id), eq(matchParticipants.userId, userId))),
    ),
    exists(
      db
        .select({ value: sql`1` })
        .from(sessionAttendances)
        .where(
          and(
            eq(sessionAttendances.sessionId, playSessions.id),
            eq(sessionAttendances.userId, userId),
          ),
        ),
    ),
  );

  const alreadyPaid = notExists(
    db
      .select({ value: sql`1` })
      .from(financeEntries)
      .where(
        and(
          eq(financeEntries.playSessionId, playSessions.id),
          eq(financeEntries.type, "income"),
          eq(financeEntries.category, "iuran_sesi"),
          eq(financeEntries.payerUserId, userId),
        ),
      ),
  );

  return db
    .select({
      sessionId: playSessions.id,
      title: playSessions.title,
      playedAt: playSessions.playedAt,
    })
    .from(playSessions)
    .where(and(lt(playSessions.playedAt, new Date()), attended, alreadyPaid))
    .orderBy(desc(playSessions.playedAt))
    .limit(limit);
}
