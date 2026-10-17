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

/** Menu area pengurus yang bisa di-assign ke user non-admin (RULES.md §5.5). */
export const menuKeyEnum = pgEnum("menu_key", ["finance", "matches", "members", "events"]);

/** Jenis transaksi kas (RULES.md §16). */
export const financeTypeEnum = pgEnum("finance_type", ["income", "expense"]);

/** Metode pembayaran transaksi kas (RULES.md §16). */
export const financePaymentMethodEnum = pgEnum("finance_payment_method", ["cash", "transfer"]);

/** Jenis pencapaian anggota (RULES.md §13.6). */
export const achievementTypeEnum = pgEnum("achievement_type", [
  "ace_of_month",
  "pang_tangguh_of_month",
  "exp_milestone",
  "sessions_milestone",
  "first_win",
  "custom",
  "ace_streak",
  "dues_diligent",
  "role",
  "family_join",
]);
