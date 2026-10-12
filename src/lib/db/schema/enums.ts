/**
 * Enum Postgres — SCHEMA.md §2.
 * Dipisah dari tabel supaya tiap file tetap ≤ 300 baris (AGENTS.md §3.2 no. 12).
 */
import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "superadmin", "member"]);

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

/** Sisi tim dalam satu pertandingan. Tim boleh 1–N orang (SCHEMA.md §3.10). */
export const matchSideEnum = pgEnum("match_side", ["a", "b"]);

/** Rencana hadir pada sesi bermain (polling). */
export const rsvpChoiceEnum = pgEnum("rsvp_choice", ["hadir", "skip"]);
