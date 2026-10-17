/**
 * Pencapaian anggota — RULES.md §13.6.
 *
 * Pencapaian bulanan disimpan per periode (`periodKey` = `YYYY-MM`), sedangkan
 * milestone memakai `periodKey = "all"`. `subjectKey` menyatukan subjek anggota
 * (`user:12`) dan BaturanNgabinton (`guest:Tri`) agar pencapaian BaturanNgabinton
 * tetap tersimpan dan bisa diwariskan saat akunnya dikonversi jadi anggota.
 */
import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { achievementDefinitions } from "./achievement-definitions";
import { achievementTypeEnum } from "./enums";
import { users } from "./users";

export const memberAchievements = pgTable(
  "member_achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: achievementTypeEnum("type").notNull(),
    /** Kode unik pencapaian, mis. `ace_of_month`, `exp_100`, `sessions_10`. */
    code: text("code").notNull(),
    /** `user:<id>` atau `guest:<nama>`. */
    subjectKey: text("subject_key").notNull(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    guestName: text("guest_name"),
    /** Terisi untuk badge kustom buatan admin. */
    definitionId: uuid("definition_id").references(() => achievementDefinitions.id, {
      onDelete: "set null",
    }),
    /** Snapshot tampilan badge kustom (agar definisi bisa diubah tanpa mengubah riwayat). */
    icon: text("icon"),
    tone: text("tone"),
    /** `YYYY-MM` untuk bulanan, `all` untuk milestone. */
    periodKey: text("period_key").notNull().default("all"),
    rank: integer("rank"),
    label: text("label").notNull(),
    description: text("description"),
    awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("member_achievements_unique").on(t.code, t.periodKey, t.subjectKey),
    index("member_achievements_user_idx").on(t.userId),
    index("member_achievements_guest_idx").on(t.guestName),
    index("member_achievements_period_idx").on(t.periodKey),
  ],
);
