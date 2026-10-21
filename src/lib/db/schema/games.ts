/**
 * Tabel mini-game Pang-Jagona — SCHEMA.md §3.13–§3.15.
 *
 * `game_scores` menyimpan setiap skor yang dikirim anggota yang login
 * (leaderboard memakai nilai tertinggi per anggota per game).
 * `pong_rooms` hanya untuk negosiasi WebRTC (kode room + SDP), `pong_matches`
 * menyimpan hasil tanding online agar masuk Riwayat Tanding.
 */
import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export const gameScores = pgTable(
  "game_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Slug game, mis. `flappy-badminton` (GAMES di `lib/games/catalog.ts`). */
    game: text("game").notNull(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("game_scores_game_score_idx").on(t.game, t.score.desc()),
    index("game_scores_user_game_idx").on(t.userId, t.game),
  ],
);

export const pongRooms = pgTable(
  "pong_rooms",
  {
    /** Kode 6 karakter yang dibagikan ke lawan. */
    code: text("code").primaryKey(),
    hostUserId: integer("host_user_id").references(() => users.id, { onDelete: "set null" }),
    hostName: text("host_name").notNull(),
    guestUserId: integer("guest_user_id").references(() => users.id, { onDelete: "set null" }),
    guestName: text("guest_name"),
    /** SDP offer host & answer tamu (non-trickle ICE, sudah lengkap). */
    hostOffer: text("host_offer"),
    guestAnswer: text("guest_answer"),
    status: text("status").notNull().default("waiting"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("pong_rooms_expires_idx").on(t.expiresAt)],
);

export const pongMatches = pgTable(
  "pong_matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomCode: text("room_code").notNull(),
    hostUserId: integer("host_user_id").references(() => users.id, { onDelete: "set null" }),
    hostName: text("host_name").notNull(),
    guestUserId: integer("guest_user_id").references(() => users.id, { onDelete: "set null" }),
    guestName: text("guest_name"),
    hostScore: integer("host_score").notNull(),
    guestScore: integer("guest_score").notNull(),
    /** `host` atau `guest`. */
    winner: text("winner").notNull(),
    playedAt: timestamp("played_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("pong_matches_room_unique").on(t.roomCode),
    index("pong_matches_host_idx").on(t.hostUserId, t.playedAt.desc()),
    index("pong_matches_guest_idx").on(t.guestUserId, t.playedAt.desc()),
  ],
);
