/**
 * Penanggung jawab (EO) per event — RULES.md §13.8.
 * Menjadi sumber badge otomatis `EO · {judul event}`.
 */
import { integer, pgTable, serial, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { events } from "./events";
import { users } from "./users";

export const eventOrganizers = pgTable(
  "event_organizers",
  {
    id: serial("id").primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("event_organizers_event_user_unique").on(t.eventId, t.userId)],
);
