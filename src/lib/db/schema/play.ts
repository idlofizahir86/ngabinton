/**
 * Tabel pencatatan permainan — SCHEMA.md §3.9–§3.12.
 *
 * Alur: admin membuat **sesi bermain** (`play_sessions`) → mencatat **game**
 * (`matches`) di dalamnya → setiap game punya **peserta** (`match_participants`,
 * 2 sisi berisi 1–N orang) dan **set** (`match_sets`, boleh 1–N set).
 * EXP dihitung per set (menang +5, kalah +2) — lihat `lib/api/exp.ts`.
 */
import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { matchSideEnum, rsvpChoiceEnum } from "./enums";
import { users } from "./users";

export const playSessions = pgTable(
  "play_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    location: text("location"),
    playedAt: timestamp("played_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    notes: text("notes"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("play_sessions_played_at_idx").on(t.playedAt.desc())],
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => playSessions.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    label: text("label"),
    notes: text("notes"),
    /** Pengurus/staf yang mencatat game ini (bisa beda orang dengan pembuat sesi). */
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("matches_session_order_unique").on(t.sessionId, t.order),
    index("matches_session_idx").on(t.sessionId, t.order),
  ],
);

export const matchParticipants = pgTable(
  "match_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
    side: matchSideEnum("side").notNull(),
    /** Terisi kalau peserta adalah anggota club; `null` untuk BaturanNgabinton. */
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    /** Nama BaturanNgabinton non-anggota. */
    guestName: text("guest_name"),
    /** Snapshot nama saat game dicatat (agar riwayat tetap terbaca). */
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("match_participants_match_idx").on(t.matchId, t.side),
    index("match_participants_user_idx").on(t.userId),
    index("match_participants_guest_idx").on(t.guestName),
  ],
);

export const matchSets = pgTable(
  "match_sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    scoreA: integer("score_a").notNull(),
    scoreB: integer("score_b").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("match_sets_match_number_unique").on(t.matchId, t.setNumber)],
);

/**
 * Kehadiran nyata pada sesi bermain ("Real Hadir").
 *
 * Hanya menyimpan kehadiran yang **ditandai pengurus** untuk anggota yang
 * datang tapi tidak tercatat di game mana pun. Peserta game (`match_participants`)
 * ikut dihitung hadir saat dibaca — lihat `getSessionAttendance()`.
 */
export const sessionAttendances = pgTable(
  "session_attendances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => playSessions.id, { onDelete: "cascade" }),
    /** Anggota club; `null` bila yang ditandai adalah BaturanNgabinton. */
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    /** Nama BaturanNgabinton (non-anggota) yang hadir. */
    guestName: text("guest_name"),
    /** Pengurus yang menandai kehadiran. */
    markedBy: integer("marked_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("session_attendances_session_user_unique").on(t.sessionId, t.userId),
    uniqueIndex("session_attendances_session_guest_unique").on(t.sessionId, t.guestName),
    index("session_attendances_session_idx").on(t.sessionId),
    index("session_attendances_user_idx").on(t.userId),
  ],
);

/**
 * Rencana hadir anggota pada sesi bermain (polling "Gass / Ga dulu").
 * Satu anggota maksimal satu pilihan per sesi.
 */
export const sessionRsvps = pgTable(
  "session_rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => playSessions.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    choice: rsvpChoiceEnum("choice").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("session_rsvps_session_user_unique").on(t.sessionId, t.userId),
    index("session_rsvps_session_idx").on(t.sessionId, t.choice),
  ],
);
