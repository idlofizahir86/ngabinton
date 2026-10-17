/**
 * Pencatatan kas NGABINTON — RULES.md §16.
 *
 * Satu baris = satu transaksi. `playSessionId` diisi kalau transaksi terkait
 * sesi bermain (mis. iuran sesi), `null` untuk transaksi kas di luar sesi
 * (donasi, beli shuttlecock, konsumsi rapat, dst).
 */
import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { financePaymentMethodEnum, financeTypeEnum } from "./enums";
import { playSessions } from "./play";
import { users } from "./users";

export const financeEntries = pgTable(
  "finance_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: financeTypeEnum("type").notNull(),
    /** Nominal dalam rupiah penuh (tanpa desimal). */
    amount: integer("amount").notNull(),
    description: text("description").notNull(),
    /** Kategori bebas, mis. `iuran_sesi`, `shuttlecock`, `konsumsi`. */
    category: text("category").notNull().default("lainnya"),
    playSessionId: uuid("play_session_id").references(() => playSessions.id, {
      onDelete: "set null",
    }),
    /** Metode pembayaran: tunai atau transfer bank. */
    paymentMethod: financePaymentMethodEnum("payment_method").notNull().default("cash"),
    /** Anggota yang membayar/menerima (mis. iuran sesi). NULL untuk transaksi umum. */
    payerUserId: integer("payer_user_id").references(() => users.id, { onDelete: "set null" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("finance_entries_occurred_at_idx").on(t.occurredAt.desc()),
    index("finance_entries_session_idx").on(t.playSessionId),
    index("finance_entries_type_idx").on(t.type),
    index("finance_entries_payer_idx").on(t.payerUserId),
  ],
);

/**
 * Perpindahan dana antar dompet (Cash ↔ Rekening Bank).
 * Tidak mengubah total Saldo Kas, hanya komposisi Cash vs Bank.
 */
export const financeTransfers = pgTable(
  "finance_transfers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromMethod: financePaymentMethodEnum("from_method").notNull(),
    toMethod: financePaymentMethodEnum("to_method").notNull(),
    amount: integer("amount").notNull(),
    description: text("description").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("finance_transfers_occurred_at_idx").on(t.occurredAt.desc())],
);
