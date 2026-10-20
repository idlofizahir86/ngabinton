/**
 * Pencapaian anggota — RULES.md §13.6.
 *
 * Pencapaian disimpan di DB (bukan dihitung ulang di UI) agar tetap ada saat
 * BaturanNgabinton dikonversi jadi anggota. Penulisan bersifat idempotent
 * (unique `code + periodKey + subjectKey`), jadi aman dipanggil berulang.
 */
import { and, asc, desc, eq, gte, inArray, isNotNull, lt, ne, sql } from "drizzle-orm";

import { getMonthlyStandings, getPlayedPeriodKeys, getStandings } from "@/lib/api/rankings";
import {
  ACE_MONTHLY_LIMIT,
  ACE_STREAK_MILESTONES,
  DUES_DILIGENCE_WINDOW,
  EXP_MILESTONES,
  PANG_TANGGUH_MIN_SESSIONS,
  SESSION_MILESTONES,
} from "@/lib/constants";
import { db } from "@/lib/db/client";
import {
  eventOrganizers,
  events,
  financeEntries,
  matchParticipants,
  memberAchievements,
  userMenuAccess,
  users,
} from "@/lib/db/schema";
import {
  getPeriod,
  getPeriodKey,
  shiftPeriod,
  type Period,
} from "@/lib/utils/period";
import { DB_READ_TIMEOUT_MS, withTimeout } from "@/lib/utils/timeout";

export type Achievement = typeof memberAchievements.$inferSelect;

export const ACHIEVEMENT_LABELS = {
  ace_of_month: "ACE Of The Month",
  pang_tangguh_of_month: "Pang-Tangguh Of The Month",
  exp_milestone: "Milestone EXP",
  sessions_milestone: "Milestone Sesi",
  first_win: "Kemenangan Pertama",
  family_join: "Become Kaluarga Ngabinton",
} as const;

export const ACHIEVEMENT_QUOTES = {
  pang_tangguh_of_month:
    "Meskipun EXP belum di puncak, semangat dan ketangguhannya di lapangan layak dipandang!",
} as const;

type AchievementInsert = typeof memberAchievements.$inferInsert;

async function insertAchievements(rows: AchievementInsert[]): Promise<void> {
  if (rows.length === 0) return;
  await db.insert(memberAchievements).values(rows).onConflictDoNothing();
}

/** Pencapaian seorang anggota (milestone + bulanan), terbaru dulu. */
export async function getAchievementsForUser(userId: number): Promise<Achievement[]> {
  return withTimeout(
    db
      .select()
      .from(memberAchievements)
      .where(eq(memberAchievements.userId, userId))
      .orderBy(desc(memberAchievements.awardedAt)),
    DB_READ_TIMEOUT_MS,
  );
}

/** Pencapaian pada satu periode (ACE & Pang-Tangguh). */
export async function getAchievementsForPeriod(periodKey: string): Promise<Achievement[]> {
  return db
    .select()
    .from(memberAchievements)
    .where(eq(memberAchievements.periodKey, periodKey))
    .orderBy(sql`${memberAchievements.rank} asc nulls last`, desc(memberAchievements.awardedAt));
}

/** Periode bulanan yang sudah difinalisasi (punya baris pencapaian). */
async function getAwardedPeriodKeys(): Promise<Set<string>> {
  const rows = await db
    .selectDistinct({ periodKey: memberAchievements.periodKey })
    .from(memberAchievements)
    .where(ne(memberAchievements.periodKey, "all"));
  return new Set(rows.map((row) => row.periodKey));
}

/** Semua pencapaian yang tertaut ke anggota — untuk badge di leaderboard. */
export async function getAchievementsMap(): Promise<Map<string, Achievement[]>> {
  const rows = await db
    .select()
    .from(memberAchievements)
    .orderBy(desc(memberAchievements.awardedAt));

  const map = new Map<string, Achievement[]>();
  for (const row of rows) {
    if (!row.userId) continue;
    const list = map.get(row.subjectKey) ?? [];
    list.push(row);
    map.set(row.subjectKey, list);
  }
  return map;
}

/** Anugerahkan ACE (top 3) & Pang-Tangguh untuk satu bulan yang sudah selesai. */
export async function awardMonthlyAchievements(period: Period): Promise<void> {
  const standings = await getMonthlyStandings(period);
  if (standings.length === 0) return;

  const rows: AchievementInsert[] = [];
  const ace = standings.slice(0, ACE_MONTHLY_LIMIT);
  ace.forEach((standing, index) => {
    rows.push({
      type: "ace_of_month",
      code: "ace_of_month",
      subjectKey: standing.key,
      userId: standing.userId,
      guestName: standing.guestName,
      periodKey: period.key,
      rank: index + 1,
      label: ACHIEVEMENT_LABELS.ace_of_month,
      description: `Peringkat #${index + 1} · ${period.label}`,
    });
  });

  const eligible = standings.filter(
    (standing) => standing.stats.sessions >= PANG_TANGGUH_MIN_SESSIONS,
  );
  if (eligible.length > 0) {
    const maxSessions = Math.max(...eligible.map((standing) => standing.stats.sessions));
    const palingRajin = eligible.filter(
      (standing) => standing.stats.sessions === maxSessions,
    );
    const minExp = Math.min(...palingRajin.map((standing) => standing.exp));
    for (const standing of palingRajin.filter((item) => item.exp === minExp)) {
      rows.push({
        type: "pang_tangguh_of_month",
        code: "pang_tangguh_of_month",
        subjectKey: standing.key,
        userId: standing.userId,
        guestName: standing.guestName,
        periodKey: period.key,
        label: ACHIEVEMENT_LABELS.pang_tangguh_of_month,
        description: `${standing.stats.sessions} sesi · ${period.label}`,
      });
    }
  }

  await insertAchievements(rows);
  await awardAceStreaks(period);
  await awardDuesDiligence(period);
}

/** ACE Of The Month beberapa bulan berturut-turut. */
async function awardAceStreaks(period: Period): Promise<void> {
  const rows = await db
    .select({
      subjectKey: memberAchievements.subjectKey,
      periodKey: memberAchievements.periodKey,
    })
    .from(memberAchievements)
    .where(eq(memberAchievements.code, "ace_of_month"))
    .orderBy(asc(memberAchievements.subjectKey), asc(memberAchievements.periodKey));

  const bySubject = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = bySubject.get(row.subjectKey) ?? new Set<string>();
    set.add(row.periodKey);
    bySubject.set(row.subjectKey, set);
  }

  const achievements: AchievementInsert[] = [];

  for (const [subjectKey, months] of bySubject) {
    if (!months.has(period.key)) continue;

    let streak = 0;
    let cursor = period.key;
    while (months.has(cursor)) {
      streak += 1;
      cursor = shiftPeriod(cursor, -1);
    }

    for (const threshold of ACE_STREAK_MILESTONES) {
      if (streak < threshold) continue;
      achievements.push({
        type: "ace_streak",
        code: `ace_streak_${threshold}`,
        subjectKey,
        userId: subjectKey.startsWith("user:") ? Number(subjectKey.slice(5)) : null,
        guestName: subjectKey.startsWith("guest:") ? subjectKey.slice(6) : null,
        periodKey: "all",
        label: `ACE ${threshold} Bulan`,
        description: `ACE Of The Month ${threshold} bulan berturut-turut s.d. ${period.label}`,
        icon: threshold >= 12 ? "crown" : threshold >= 6 ? "flame" : "trending-up",
        tone: "warning",
      });
    }
  }

  await insertAchievements(achievements);
}

/** Badge bulanan untuk anggota paling rajin membayar iuran dalam 3 bulan terakhir. */
async function awardDuesDiligence(period: Period): Promise<void> {
  const startKey = shiftPeriod(period.key, -(DUES_DILIGENCE_WINDOW - 1));
  const start = getPeriod(startKey).start;

  const rows = await db
    .select({
      payerUserId: financeEntries.payerUserId,
      total: sql<number>`count(*)::int`,
    })
    .from(financeEntries)
    .where(
      and(
        eq(financeEntries.type, "income"),
        eq(financeEntries.category, "iuran_sesi"),
        isNotNull(financeEntries.payerUserId),
        gte(financeEntries.occurredAt, start),
        lt(financeEntries.occurredAt, period.end),
      ),
    )
    .groupBy(financeEntries.payerUserId);

  const valid = rows.filter(
    (row): row is { payerUserId: number; total: number } => row.payerUserId !== null,
  );
  if (valid.length === 0) return;

  const max = Math.max(...valid.map((row) => row.total));

  const achievements: AchievementInsert[] = valid
    .filter((row) => row.total === max)
    .map((row) => ({
      type: "dues_diligent",
      code: "dues_diligent_3m",
      subjectKey: `user:${row.payerUserId}`,
      userId: row.payerUserId,
      periodKey: period.key,
      label: "Rajin Iuran 3 Bulan",
      description: `${row.total} iuran dalam ${DUES_DILIGENCE_WINDOW} bulan terakhir · ${period.label}`,
      icon: "coins",
      tone: "live",
    }));

  await insertAchievements(achievements);
}

/** Sinkronkan badge peran: pengurus keuangan & EO event (RULES.md §13.8). */
export async function syncRoleBadges(): Promise<void> {
  const [financeUsers, organizers] = await Promise.all([
    db
      .select({ userId: users.id })
      .from(userMenuAccess)
      .innerJoin(users, eq(users.id, userMenuAccess.userId))
      .where(
        and(
          eq(userMenuAccess.menu, "finance"),
          eq(users.role, "member"),
          eq(users.isActive, true),
        ),
      ),
    db
      .select({
        userId: eventOrganizers.userId,
        slug: events.slug,
        title: events.title,
      })
      .from(eventOrganizers)
      .innerJoin(events, eq(events.id, eventOrganizers.eventId))
      .innerJoin(users, eq(users.id, eventOrganizers.userId))
      .where(and(eq(users.role, "member"), eq(users.isActive, true))),
  ]);

  const desired = new Map<string, AchievementInsert>();

  for (const row of financeUsers) {
    const code = "role_finance_steward";
    desired.set(`${code}|user:${row.userId}`, {
      type: "role",
      code,
      subjectKey: `user:${row.userId}`,
      userId: row.userId,
      periodKey: "all",
      label: "Yang Urus Duit Bersama",
      description: "Dipercaya mengelola keuangan Ngabinton",
      icon: "wallet",
      tone: "live",
    });
  }

  for (const row of organizers) {
    const code = `role_eo_${row.slug}`;
    desired.set(`${code}|user:${row.userId}`, {
      type: "role",
      code,
      subjectKey: `user:${row.userId}`,
      userId: row.userId,
      periodKey: "all",
      label: `EO · ${row.title}`,
      description: `Penanggung jawab ${row.title}`,
      icon: "megaphone",
      tone: "warning",
    });
  }

  await insertAchievements([...desired.values()]);

  const existing = await db
    .select({
      id: memberAchievements.id,
      code: memberAchievements.code,
      subjectKey: memberAchievements.subjectKey,
    })
    .from(memberAchievements)
    .where(eq(memberAchievements.type, "role"));

  const staleIds = existing
    .filter((row) => !desired.has(`${row.code}|${row.subjectKey}`))
    .map((row) => row.id);

  if (staleIds.length > 0) {
    await db
      .delete(memberAchievements)
      .where(
        and(eq(memberAchievements.type, "role"), inArray(memberAchievements.id, staleIds)),
      );
  }
}

/** Anugerahkan milestone EXP, jumlah sesi, dan kemenangan pertama (all-time). */
export async function awardMilestoneAchievements(): Promise<void> {
  const standings = await getStandings();
  const rows: AchievementInsert[] = [];

  for (const standing of standings) {
    for (const threshold of EXP_MILESTONES) {
      if (standing.exp < threshold) continue;
      rows.push({
        type: "exp_milestone",
        code: `exp_${threshold}`,
        subjectKey: standing.key,
        userId: standing.userId,
        guestName: standing.guestName,
        periodKey: "all",
        label: `${threshold} EXP`,
        description: "Milestone EXP sepanjang masa",
      });
    }

    for (const threshold of SESSION_MILESTONES) {
      if (standing.stats.sessions < threshold) continue;
      rows.push({
        type: "sessions_milestone",
        code: `sessions_${threshold}`,
        subjectKey: standing.key,
        userId: standing.userId,
        guestName: standing.guestName,
        periodKey: "all",
        label: `${threshold} Sesi`,
        description: "Rajin turun ke lapangan",
      });
    }

    if (standing.stats.setsWon > 0) {
      rows.push({
        type: "first_win",
        code: "first_win",
        subjectKey: standing.key,
        userId: standing.userId,
        guestName: standing.guestName,
        periodKey: "all",
        label: ACHIEVEMENT_LABELS.first_win,
        description: "Set pertama yang dimenangkan",
      });
    }
  }

  await insertAchievements(rows);
}

/**
 * Badge penyambutan: BaturanNgabinton yang resmi menjadi anggota keluarga
 * Ngabinton (RULES.md §13.9). Disimpan sekali seumur akun.
 */
function familyJoinRow(userId: number): AchievementInsert {
  return {
    type: "family_join",
    code: "family_join",
    subjectKey: `user:${userId}`,
    userId,
    periodKey: "all",
    label: ACHIEVEMENT_LABELS.family_join,
    description: "Dari BaturanNgabinton menjadi anggota keluarga Ngabinton",
    icon: "home",
    tone: "live",
  };
}

/** Anugerahkan badge penyambutan ke satu anggota. */
export async function awardFamilyJoin(userId: number): Promise<void> {
  await insertAchievements([familyJoinRow(userId)]);
}

/**
 * Backfill badge penyambutan untuk anggota yang riwayat BaturanNgabinton-nya
 * sudah tertaut (game lama tetap menyimpan `guestName` setelah dikonversi).
 */
export async function backfillFamilyJoin(): Promise<void> {
  const rows = await db
    .selectDistinct({ userId: matchParticipants.userId })
    .from(matchParticipants)
    .innerJoin(users, eq(users.id, matchParticipants.userId))
    .where(
      and(
        isNotNull(matchParticipants.userId),
        isNotNull(matchParticipants.guestName),
        eq(users.role, "member"),
        eq(users.isActive, true),
      ),
    );

  const userIds = rows
    .map((row) => row.userId)
    .filter((userId): userId is number => userId !== null);

  await insertAchievements(userIds.map(familyJoinRow));
}

/**
 * Finalisasi ACE/Pang-Tangguh untuk bulan yang sudah lewat dan belum punya
 * pencapaian. Murah (2 query) saat semua sudah final — dipakai di render halaman.
 */
export async function ensureMonthlyAwards(): Promise<void> {
  const currentKey = getPeriodKey();
  const [keys, awarded] = await Promise.all([getPlayedPeriodKeys(), getAwardedPeriodKeys()]);

  for (const key of keys) {
    if (key >= currentKey || awarded.has(key)) continue;
    await awardMonthlyAchievements(getPeriod(key));
  }
}

/**
 * Sinkronkan semua pencapaian (bulanan + milestone).
 * Dipanggil setelah game dicatat/konversi anggota, dan dari admin pencapaian.
 */
export async function syncAchievements(): Promise<void> {
  await ensureMonthlyAwards();

  // Backfill streak ACE & badge iuran untuk semua bulan yang sudah selesai.
  const currentKey = getPeriodKey();
  for (const key of await getPlayedPeriodKeys()) {
    if (key >= currentKey) continue;
    const period = getPeriod(key);
    await awardAceStreaks(period);
    await awardDuesDiligence(period);
  }

  await awardMilestoneAchievements();
  await backfillFamilyJoin();
  await syncRoleBadges();
}

/** Pindahkan pencapaian BaturanNgabinton ke akun anggota hasil konversi. */
export async function promoteGuestAchievements(
  guestName: string,
  userId: number,
): Promise<void> {
  const rows = await db
    .select()
    .from(memberAchievements)
    .where(
      and(
        eq(memberAchievements.guestName, guestName),
        eq(memberAchievements.subjectKey, `guest:${guestName}`),
      ),
    );

  for (const row of rows) {
    const targetKey = `user:${userId}`;
    const existing = await db
      .select({ id: memberAchievements.id })
      .from(memberAchievements)
      .where(
        and(
          eq(memberAchievements.code, row.code),
          eq(memberAchievements.periodKey, row.periodKey),
          eq(memberAchievements.subjectKey, targetKey),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db.delete(memberAchievements).where(eq(memberAchievements.id, row.id));
      continue;
    }

    await db
      .update(memberAchievements)
      .set({ userId, guestName: null, subjectKey: targetKey })
      .where(eq(memberAchievements.id, row.id));
  }
}
