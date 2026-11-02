/**
 * Media "Mabar Seruu" (instans mabar) — SCHEMA.md §3.20.
 *
 * Siapa pun yang sudah login bisa merekam/mengunggah foto atau video singkat
 * dari sesi mabar. Setiap baris **berstatus `pending`** sampai admin utama
 * menyetujuinya; hanya `approved` yang tampil di `/dokumentasi/mabar-seruu`.
 */
import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { sessionMediaKindEnum, sessionMediaStatusEnum } from "./enums";
import { playSessions } from "./play";
import { users } from "./users";

export const sessionMedia = pgTable(
  "session_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Sesi mabar terkait; tetap disimpan walau sesi dihapus (`set null`). */
    sessionId: uuid("session_id").references(() => playSessions.id, { onDelete: "set null" }),
    uploaderUserId: integer("uploader_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    kind: sessionMediaKindEnum("kind").notNull(),
    /** Path objek di Supabase Storage (bucket `public`, prefix `mabar-seruu`). */
    storagePath: text("storage_path").notNull(),
    /** Frame pembuka video (WebP) agar grid tidak perlu memuat video. */
    posterPath: text("poster_path"),
    caption: text("caption"),
    /** Durasi video dalam detik (dilaporkan klien, maks 15 — divalidasi Zod). */
    durationSeconds: integer("duration_seconds"),
    width: integer("width"),
    height: integer("height"),
    status: sessionMediaStatusEnum("status").notNull().default("pending"),
    reviewedByUserId: integer("reviewed_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNote: text("review_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("session_media_status_created_idx").on(t.status, t.createdAt.desc()),
    index("session_media_session_idx").on(t.sessionId),
    index("session_media_uploader_idx").on(t.uploaderUserId),
  ],
);
