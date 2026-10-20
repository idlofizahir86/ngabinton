/**
 * Ringkasan saldo kas NGABINTON (`RULES.md` §16).
 * Dipisah dari `finance.ts` agar tiap file tetap di bawah 300 baris.
 */
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/lib/db/client";
import { financeEntries, financeTransfers } from "@/lib/db/schema";
import { DB_READ_TIMEOUT_MS, withTimeout } from "@/lib/utils/timeout";

export type MethodTotals = {
  income: number;
  expense: number;
  balance: number;
  /** Dana masuk dari dompet lain (transfer internal). */
  transferIn: number;
  /** Dana keluar ke dompet lain (transfer internal). */
  transferOut: number;
};

export type FinanceTotals = {
  income: number;
  expense: number;
  balance: number;
  /** Saldo tunai (cash). */
  cash: MethodTotals;
  /** Saldo rekening bank (transfer). */
  transfer: MethodTotals;
};

type RawTotals = {
  income: number;
  expense: number;
  cashIncome: number;
  cashExpense: number;
  transferIncome: number;
  transferExpense: number;
};

const TOTAL_COLUMNS = {
  income: sql<number>`coalesce(sum(case when ${financeEntries.type} = 'income' then ${financeEntries.amount} else 0 end), 0)::int`,
  expense: sql<number>`coalesce(sum(case when ${financeEntries.type} = 'expense' then ${financeEntries.amount} else 0 end), 0)::int`,
  cashIncome: sql<number>`coalesce(sum(case when ${financeEntries.type} = 'income' and ${financeEntries.paymentMethod} = 'cash' then ${financeEntries.amount} else 0 end), 0)::int`,
  cashExpense: sql<number>`coalesce(sum(case when ${financeEntries.type} = 'expense' and ${financeEntries.paymentMethod} = 'cash' then ${financeEntries.amount} else 0 end), 0)::int`,
  transferIncome: sql<number>`coalesce(sum(case when ${financeEntries.type} = 'income' and ${financeEntries.paymentMethod} = 'transfer' then ${financeEntries.amount} else 0 end), 0)::int`,
  transferExpense: sql<number>`coalesce(sum(case when ${financeEntries.type} = 'expense' and ${financeEntries.paymentMethod} = 'transfer' then ${financeEntries.amount} else 0 end), 0)::int`,
} as const;

export const ZERO_TOTALS: FinanceTotals = {
  income: 0,
  expense: 0,
  balance: 0,
  cash: { income: 0, expense: 0, balance: 0, transferIn: 0, transferOut: 0 },
  transfer: { income: 0, expense: 0, balance: 0, transferIn: 0, transferOut: 0 },
};

function toTotals(row: RawTotals | undefined): FinanceTotals {
  if (!row) return ZERO_TOTALS;
  return {
    income: row.income,
    expense: row.expense,
    balance: row.income - row.expense,
    cash: {
      income: row.cashIncome,
      expense: row.cashExpense,
      balance: row.cashIncome - row.cashExpense,
      transferIn: 0,
      transferOut: 0,
    },
    transfer: {
      income: row.transferIncome,
      expense: row.transferExpense,
      balance: row.transferIncome - row.transferExpense,
      transferIn: 0,
      transferOut: 0,
    },
  };
}

/** Total pemasukan, pengeluaran, dan saldo (total, cash, transfer) pada rentang waktu. */
async function computeFinanceTotals(from?: Date, to?: Date): Promise<FinanceTotals> {
  const conditions = [];
  if (from) conditions.push(gte(financeEntries.occurredAt, from));
  if (to) conditions.push(lt(financeEntries.occurredAt, to));

  const transferConditions = [];
  if (from) transferConditions.push(gte(financeTransfers.occurredAt, from));
  if (to) transferConditions.push(lt(financeTransfers.occurredAt, to));

  const [rows, transferRows] = await withTimeout(
    Promise.all([
      db
        .select(TOTAL_COLUMNS)
        .from(financeEntries)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
      db
        .select({
          cashIn: sql<number>`coalesce(sum(case when ${financeTransfers.toMethod} = 'cash' then ${financeTransfers.amount} else 0 end), 0)::int`,
          cashOut: sql<number>`coalesce(sum(case when ${financeTransfers.fromMethod} = 'cash' then ${financeTransfers.amount} else 0 end), 0)::int`,
          transferIn: sql<number>`coalesce(sum(case when ${financeTransfers.toMethod} = 'transfer' then ${financeTransfers.amount} else 0 end), 0)::int`,
          transferOut: sql<number>`coalesce(sum(case when ${financeTransfers.fromMethod} = 'transfer' then ${financeTransfers.amount} else 0 end), 0)::int`,
        })
        .from(financeTransfers)
        .where(transferConditions.length > 0 ? and(...transferConditions) : undefined),
    ]),
    DB_READ_TIMEOUT_MS,
  );

  const base = toTotals(rows[0]);
  const moved = transferRows[0] ?? { cashIn: 0, cashOut: 0, transferIn: 0, transferOut: 0 };

  return {
    ...base,
    cash: {
      ...base.cash,
      transferIn: moved.cashIn,
      transferOut: moved.cashOut,
      balance: base.cash.balance + moved.cashIn - moved.cashOut,
    },
    transfer: {
      ...base.transfer,
      transferIn: moved.transferIn,
      transferOut: moved.transferOut,
      balance: base.transfer.balance + moved.transferIn - moved.transferOut,
    },
  };
}

/**
 * Di-cache 60 detik (tag `finance`) karena angka kas sama untuk semua anggota;
 * setiap mutasi keuangan memanggil `revalidateTag("finance")`.
 */
const getFinanceTotalsCached = unstable_cache(
  async (fromMs: number | null, toMs: number | null) =>
    computeFinanceTotals(
      fromMs === null ? undefined : new Date(fromMs),
      toMs === null ? undefined : new Date(toMs),
    ),
  ["finance-totals"],
  { revalidate: 60, tags: ["finance"] },
);

/** Total pemasukan, pengeluaran, dan saldo pada rentang waktu. */
export async function getFinanceTotals(from?: Date, to?: Date): Promise<FinanceTotals> {
  return getFinanceTotalsCached(from?.getTime() ?? null, to?.getTime() ?? null);
}

/** Total keuangan satu sesi bermain (mis. iuran sesi). */
export async function getSessionFinanceTotals(sessionId: string): Promise<FinanceTotals> {
  const rows = await withTimeout(
    db
      .select(TOTAL_COLUMNS)
      .from(financeEntries)
      .where(eq(financeEntries.playSessionId, sessionId)),
    DB_READ_TIMEOUT_MS,
  );

  return toTotals(rows[0]);
}
