/**
 * Query baca keuangan NGABINTON (RULES.md §16).
 * Keuangan transparan: semua anggota yang login boleh melihat seluruh transaksi.
 */
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { unstable_cache } from "next/cache";

import type { FinancePaymentMethod } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { financeEntries, financeTransfers, playSessions, users } from "@/lib/db/schema";
import { DB_READ_TIMEOUT_MS, withTimeout } from "@/lib/utils/timeout";

export type FinanceType = "income" | "expense";

const payer = alias(users, "finance_payer");

export type FinanceEntryRow = {
  id: string;
  type: FinanceType;
  amount: number;
  description: string;
  category: string;
  paymentMethod: FinancePaymentMethod;
  payerId: number | null;
  payerName: string | null;
  occurredAt: Date;
  sessionId: string | null;
  sessionTitle: string | null;
  createdByName: string | null;
};

export type FinanceEntryFilters = {
  type?: FinanceType;
  from?: Date;
  to?: Date;
  sessionId?: string;
  limit?: number;
};

/** Daftar transaksi terbaru + nama pencatat & judul sesi. */
export async function getFinanceEntries(
  filters: FinanceEntryFilters = {},
): Promise<FinanceEntryRow[]> {
  const conditions = [];
  if (filters.type) conditions.push(eq(financeEntries.type, filters.type));
  if (filters.from) conditions.push(gte(financeEntries.occurredAt, filters.from));
  if (filters.to) conditions.push(lt(financeEntries.occurredAt, filters.to));
  if (filters.sessionId) conditions.push(eq(financeEntries.playSessionId, filters.sessionId));

  const rows = await withTimeout(
    db
      .select({
        id: financeEntries.id,
        type: financeEntries.type,
        amount: financeEntries.amount,
        description: financeEntries.description,
        category: financeEntries.category,
        paymentMethod: financeEntries.paymentMethod,
        payerId: financeEntries.payerUserId,
        payerName: sql<string | null>`coalesce(${payer.displayName}, ${financeEntries.payerGuestName})`,
        occurredAt: financeEntries.occurredAt,
        sessionId: financeEntries.playSessionId,
        sessionTitle: playSessions.title,
        createdByName: users.displayName,
      })
      .from(financeEntries)
      .leftJoin(playSessions, eq(playSessions.id, financeEntries.playSessionId))
      .leftJoin(users, eq(users.id, financeEntries.createdBy))
      .leftJoin(payer, eq(payer.id, financeEntries.payerUserId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(financeEntries.occurredAt), desc(financeEntries.createdAt))
      .limit(filters.limit ?? 200),
    DB_READ_TIMEOUT_MS,
  );

  return rows;
}

/** Satu transaksi berdasarkan id (untuk halaman edit). */
export async function getFinanceEntryById(id: string): Promise<FinanceEntryRow | null> {
  const direct = await withTimeout(
    db
      .select({
        id: financeEntries.id,
        type: financeEntries.type,
        amount: financeEntries.amount,
        description: financeEntries.description,
        category: financeEntries.category,
        paymentMethod: financeEntries.paymentMethod,
        payerId: financeEntries.payerUserId,
        payerName: sql<string | null>`coalesce(${payer.displayName}, ${financeEntries.payerGuestName})`,
        occurredAt: financeEntries.occurredAt,
        sessionId: financeEntries.playSessionId,
        sessionTitle: playSessions.title,
        createdByName: users.displayName,
      })
      .from(financeEntries)
      .leftJoin(playSessions, eq(playSessions.id, financeEntries.playSessionId))
      .leftJoin(users, eq(users.id, financeEntries.createdBy))
      .leftJoin(payer, eq(payer.id, financeEntries.payerUserId))
      .where(eq(financeEntries.id, id))
      .limit(1),
    DB_READ_TIMEOUT_MS,
  );

  return direct[0] ?? null;
}

export type FinanceTransferRow = {
  id: string;
  fromMethod: FinancePaymentMethod;
  toMethod: FinancePaymentMethod;
  amount: number;
  description: string;
  occurredAt: Date;
  createdByName: string | null;
};

/** Riwayat perpindahan dana Cash ↔ Rekening Bank (opsional per rentang tanggal). */
export async function getFinanceTransfers(
  from?: Date,
  to?: Date,
  limit: number = 200,
): Promise<FinanceTransferRow[]> {
  const conditions = [];
  if (from) conditions.push(gte(financeTransfers.occurredAt, from));
  if (to) conditions.push(lt(financeTransfers.occurredAt, to));

  return withTimeout(
    db
      .select({
        id: financeTransfers.id,
        fromMethod: financeTransfers.fromMethod,
        toMethod: financeTransfers.toMethod,
        amount: financeTransfers.amount,
        description: financeTransfers.description,
        occurredAt: financeTransfers.occurredAt,
        createdByName: users.displayName,
      })
      .from(financeTransfers)
      .leftJoin(users, eq(users.id, financeTransfers.createdBy))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(financeTransfers.occurredAt), desc(financeTransfers.createdAt))
      .limit(limit),
    DB_READ_TIMEOUT_MS,
  );
}

async function computeFinancePeriodKeys(): Promise<string[]> {
  const [entryRows, transferRows] = await withTimeout(
    Promise.all([
      db
        .select({
          key: sql<string>`to_char(${financeEntries.occurredAt} at time zone 'Asia/Jakarta', 'YYYY-MM')`,
        })
        .from(financeEntries)
        .groupBy(sql`1`),
      db
        .select({
          key: sql<string>`to_char(${financeTransfers.occurredAt} at time zone 'Asia/Jakarta', 'YYYY-MM')`,
        })
        .from(financeTransfers)
        .groupBy(sql`1`),
    ]),
    DB_READ_TIMEOUT_MS,
  );

  return [...new Set([...entryRows, ...transferRows].map((row) => row.key))].sort((a, b) =>
    b.localeCompare(a),
  );
}

/** Bulan-bulan (YYYY-MM) yang punya transaksi atau pindah dana (cache 60 detik). */
const getFinancePeriodKeysCached = unstable_cache(computeFinancePeriodKeys, ["finance-period-keys"], {
  revalidate: 60,
  tags: ["finance"],
});

export async function getFinancePeriodKeys(): Promise<string[]> {
  return getFinancePeriodKeysCached();
}

export {
  getFinanceTotals,
  getSessionFinanceTotals,
  ZERO_TOTALS,
  type FinanceTotals,
  type MethodTotals,
} from "./finance-totals";
