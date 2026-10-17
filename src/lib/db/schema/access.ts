/**
 * Hak akses menu area pengurus — RULES.md §5.5.
 * Admin/superadmin otomatis punya semua menu; baris di sini hanya untuk user non-admin.
 */
import { index, integer, pgTable, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { menuKeyEnum } from "./enums";
import { users } from "./users";

export const userMenuAccess = pgTable(
  "user_menu_access",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    menu: menuKeyEnum("menu").notNull(),
    grantedBy: integer("granted_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("user_menu_access_user_menu_unique").on(t.userId, t.menu),
    index("user_menu_access_user_idx").on(t.userId),
  ],
);
