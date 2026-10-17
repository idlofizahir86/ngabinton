import type { Metadata } from "next";
import Link from "next/link";

import { FinanceLedger } from "@/components/finance/finance-ledger";
import { FinanceSummary } from "@/components/finance/finance-summary";
import { Container } from "@/components/layout/container";
import { MonthFilter } from "@/components/layout/month-filter";
import {
  getFinanceEntries,
  getFinancePeriodKeys,
  getFinanceTotals,
  getFinanceTransfers,
} from "@/lib/api/finance";
import { requireUser } from "@/lib/auth/guards";
import {
  currentPeriod,
  getPeriod,
  isValidPeriodKey,
  periodOptionsFromDates,
} from "@/lib/utils/period";

export const metadata: Metadata = {
  title: "Keuangan Ngabinton — NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = { searchParams: Promise<{ periode?: string }> };

/** Transparansi keuangan untuk semua anggota yang login (RULES.md §16). */
export default async function MemberFinancePage({ searchParams }: PageProps) {
  await requireUser();
  const params = await searchParams;
  const current = currentPeriod();
  const selectedPeriod = isValidPeriodKey(params.periode) ? getPeriod(params.periode) : null;
  const period = selectedPeriod ?? current;
  const from = selectedPeriod?.start;
  const to = selectedPeriod?.end;

  const [entries, transfers, allTime, monthTotals, periodKeys] = await Promise.all([
    getFinanceEntries({ from, to }),
    getFinanceTransfers(from, to),
    getFinanceTotals(),
    getFinanceTotals(period.start, period.end),
    getFinancePeriodKeys(),
  ]);

  return (
    <div className="pb-24 pt-28">
      <Container size="lg">
        <Link href="/member" className="text-sm text-text-muted transition hover:text-text">
          ← Area anggota
        </Link>

        <header className="mt-4">
          <p className="text-xs uppercase tracking-[0.04em] text-primary">Transparansi</p>
          <h1 className="mt-1 font-display text-4xl text-text">Keuangan Ngabinton</h1>
          <p className="mt-3 max-w-2xl text-text-muted">
            Semua pemasukan dan pengeluaran kas terbuka untuk anggota. Iuran sesi, donasi, sampai
            pembelian shuttlecock tercatat lengkap dengan metode pembayaran (cash/transfer), anggota
            pembayar, dan siapa yang mencatat.
          </p>
        </header>

        <section className="mt-8">
          <FinanceSummary totals={allTime} caption="Saldo keseluruhan" />
          <p className="mt-3 text-sm text-text-muted">
            {period.label}: pemasukan Rp {monthTotals.income.toLocaleString("id-ID")} · pengeluaran
            Rp {monthTotals.expense.toLocaleString("id-ID")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text">Buku Kas</h2>
          <p className="mt-1 text-sm text-text-muted">
            Urut dari transaksi terbaru. Nominal hijau = pemasukan, merah = pengeluaran.
          </p>
          <div className="mt-4">
            <MonthFilter
              action="/member/keuangan"
              value={selectedPeriod?.key ?? ""}
              options={periodOptionsFromDates(periodKeys.map((key) => getPeriod(key).start))}
              allOption={{ value: "", label: "Semua bulan" }}
            />
          </div>
          <div className="mt-4">
            <FinanceLedger
              entries={entries}
              transfers={transfers}
              emptyText="Belum ada transaksi. Kas akan tampil di sini setelah pengurus mencatat."
            />
          </div>
        </section>
      </Container>
    </div>
  );
}
