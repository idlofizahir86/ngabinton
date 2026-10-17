/**
 * Katalog badge kustom yang dibuat admin (RULES.md §13.7).
 * Badge otomatis (ACE, Pang-Tangguh, milestone) tidak disimpan di sini —
 * aturannya ada di kode & ditampilkan sebagai referensi di halaman admin.
 */
import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export const achievementDefinitions = pgTable("achievement_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Kode unik internal, mis. `juara_internal`. */
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  /** Kunci ikon lucide: `trophy`, `medal`, `crown`, `flame`, `star`, `zap`, `target`, `award`, `shield`, `heart`. */
  icon: text("icon").notNull().default("award"),
  /** Warna badge: `primary`, `live`, `warning`, `neutral`. */
  tone: text("tone").notNull().default("primary"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
