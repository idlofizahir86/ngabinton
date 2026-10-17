/** Query katalog badge kustom & riwayat pemberiannya (RULES.md §13.7). */
import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { achievementDefinitions, memberAchievements, users } from "@/lib/db/schema";

export type AchievementDefinition = typeof achievementDefinitions.$inferSelect;

/** Semua definisi badge kustom (aktif dulu). */
export async function getAchievementDefinitions(): Promise<AchievementDefinition[]> {
  return db
    .select()
    .from(achievementDefinitions)
    .orderBy(desc(achievementDefinitions.isActive), asc(achievementDefinitions.name));
}

/** Satu definisi berdasarkan id. */
export async function getAchievementDefinition(id: string): Promise<AchievementDefinition | null> {
  const rows = await db
    .select()
    .from(achievementDefinitions)
    .where(eq(achievementDefinitions.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export type CustomAwardRow = {
  id: string;
  memberId: number | null;
  memberName: string | null;
  label: string;
  note: string | null;
  awardedAt: Date;
  icon: string | null;
  tone: string | null;
};

/** Riwayat pemberian badge kustom (terbaru dulu). */
export async function getRecentCustomAwards(limit: number = 50): Promise<CustomAwardRow[]> {
  return db
    .select({
      id: memberAchievements.id,
      memberId: memberAchievements.userId,
      memberName: users.displayName,
      label: memberAchievements.label,
      note: memberAchievements.description,
      awardedAt: memberAchievements.awardedAt,
      icon: memberAchievements.icon,
      tone: memberAchievements.tone,
    })
    .from(memberAchievements)
    .leftJoin(users, eq(users.id, memberAchievements.userId))
    .where(and(eq(memberAchievements.type, "custom"), eq(memberAchievements.periodKey, "all")))
    .orderBy(desc(memberAchievements.awardedAt))
    .limit(limit);
}
