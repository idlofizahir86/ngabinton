/**
 * Tabel `users` — admin, pengurus, dan anggota club (SCHEMA.md §3.1).
 * Anggota club memakai kolom tambahan: `nickname`, `wa_number`, `avatar_key`, `exp`.
 */
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { userRoleEnum } from "./enums";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  /** Nama punggung (nickname) yang tampil di Pang-Giatna Ngabinton. */
  nickname: text("nickname"),
  /** Nomor WhatsApp ternormalisasi (mis. `62812...`). Alternatif login selain username. */
  waNumber: text("wa_number").unique(),
  /** Kunci preset avatar (monogram/ikon). Digunakan bila `avatar_url` kosong. */
  avatarKey: text("avatar_key"),
  /** URL foto avatar yang di-upload anggota (Supabase Storage). */
  avatarUrl: text("avatar_url"),
  /** Total EXP dari seluruh set yang dimainkan (cache; sumber hitung di `lib/api/exp.ts`). */
  exp: integer("exp").notNull().default(0),
  role: userRoleEnum("role").notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
