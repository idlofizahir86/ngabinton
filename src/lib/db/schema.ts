/**
 * Schema Drizzle NGABINTON — seluruh tabel & enum.
 * Sumber kebenaran: `SCHEMA.md` §3 (8 tabel, 4 enum) & §4 (relations).
 * Setiap perubahan skema WAJIB update `SCHEMA.md` dulu.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ============================================================
// Enums (SCHEMA.md §2)
// ============================================================
export const userRoleEnum = pgEnum("user_role", ["admin", "superadmin"]);
export const eventTypeEnum = pgEnum("event_type", ["badminton", "travel", "gathering"]);
export const eventThemeEnum = pgEnum("event_theme", ["cinema", "storytelling"]);
export const mediaTypeEnum = pgEnum("media_type", [
  "poster",
  "destination",
  "food",
  "transport",
  "participant",
  "gallery",
]);

// ============================================================
// 3.1 users
// ============================================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: userRoleEnum("role").notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================
// 3.2 events
// ============================================================
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    eventType: eventTypeEnum("event_type").notNull(),
    theme: eventThemeEnum("theme").notNull().default("cinema"),
    heroImageUrl: text("hero_image_url"),
    coverImageUrl: text("cover_image_url"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    meetingPoint: text("meeting_point"),
    meetingTime: text("meeting_time"),
    returnTime: text("return_time"),
    location: text("location"),
    locationUrl: text("location_url"),
    transportMode: text("transport_mode"),
    price: integer("price"),
    quota: integer("quota"),
    isPublished: boolean("is_published").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("events_published_starts_idx").on(t.isPublished, t.startsAt.desc()),
    index("events_type_idx").on(t.eventType),
  ],
);

// ============================================================
// 3.3 rundown_items
// ============================================================
export const rundownItems = pgTable(
  "rundown_items",
  {
    id: serial("id").primaryKey(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    time: text("time").notNull(),
    title: text("title").notNull(),
    note: text("note"),
    isOptional: boolean("is_optional").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("rundown_event_order_unique").on(t.eventId, t.order),
    index("rundown_event_idx").on(t.eventId, t.order),
  ],
);

// ============================================================
// 3.4 budget_items
// ============================================================
export const budgetItems = pgTable(
  "budget_items",
  {
    id: serial("id").primaryKey(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    label: text("label").notNull(),
    amount: integer("amount").notNull(),
    isTotal: boolean("is_total").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("budget_event_order_unique").on(t.eventId, t.order)],
);

// ============================================================
// 3.5 event_media
// ============================================================
export const eventMedia = pgTable(
  "event_media",
  {
    id: serial("id").primaryKey(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    type: mediaTypeEnum("type").notNull(),
    url: text("url").notNull(),
    alt: text("alt"),
    caption: text("caption"),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("media_event_type_idx").on(t.eventId, t.type, t.order)],
);

// ============================================================
// 3.6 event_extras
// ============================================================
export const eventExtras = pgTable(
  "event_extras",
  {
    id: serial("id").primaryKey(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: jsonb("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("extras_event_key_unique").on(t.eventId, t.key)],
);

// ============================================================
// 3.7 attendance_sessions
// ============================================================
export const attendanceSessions = pgTable(
  "attendance_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    sessionCode: text("session_code").notNull().unique(),
    label: text("label"),
    isActive: boolean("is_active").notNull().default(false),
    openedAt: timestamp("opened_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    autoCloseAt: timestamp("auto_close_at", { withTimezone: true }),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("sessions_code_unique").on(t.sessionCode),
    index("sessions_active_event_idx").on(t.eventId, t.isActive),
  ],
);

// ============================================================
// 3.8 attendances
// ============================================================
export const attendances = pgTable(
  "attendances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => attendanceSessions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    organization: text("organization"),
    bringsGift: boolean("brings_gift").notNull().default(false),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("attendances_session_idx").on(t.sessionId, t.checkedInAt),
    uniqueIndex("attendances_session_phone_unique")
      .on(t.sessionId, t.phone)
      .where(sql`${t.phone} IS NOT NULL`),
    index("attendances_session_name_ip_idx").on(t.sessionId, t.name, t.ipHash),
  ],
);

// ============================================================
// Relations (SCHEMA.md §4)
// ============================================================
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  sessions: many(attendanceSessions),
}));

export const eventsRelations = relations(events, ({ many, one }) => ({
  rundownItems: many(rundownItems),
  budgetItems: many(budgetItems),
  media: many(eventMedia),
  extras: many(eventExtras),
  sessions: many(attendanceSessions),
  createdByUser: one(users, { fields: [events.createdBy], references: [users.id] }),
}));

export const rundownItemsRelations = relations(rundownItems, ({ one }) => ({
  event: one(events, { fields: [rundownItems.eventId], references: [events.id] }),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  event: one(events, { fields: [budgetItems.eventId], references: [events.id] }),
}));

export const eventMediaRelations = relations(eventMedia, ({ one }) => ({
  event: one(events, { fields: [eventMedia.eventId], references: [events.id] }),
}));

export const eventExtrasRelations = relations(eventExtras, ({ one }) => ({
  event: one(events, { fields: [eventExtras.eventId], references: [events.id] }),
}));

export const attendanceSessionsRelations = relations(attendanceSessions, ({ one, many }) => ({
  event: one(events, { fields: [attendanceSessions.eventId], references: [events.id] }),
  createdByUser: one(users, { fields: [attendanceSessions.createdBy], references: [users.id] }),
  attendances: many(attendances),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  session: one(attendanceSessions, { fields: [attendances.sessionId], references: [attendanceSessions.id] }),
}));

