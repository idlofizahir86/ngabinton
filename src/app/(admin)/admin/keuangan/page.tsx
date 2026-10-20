import type { Metadata } from "next";
import Link from "next/link";

import { FinanceEntryTabs } from "@/components/finance/finance-entry-tabs";
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
import { getMemberOptions, getPlaySessions } from "@/lib/api/matches";
import { requireMenu } from "@/lib/auth/guards";
import {
  currentPeriod,
  getPeriod,
  isValidPeriodKey,
  periodOptionsFromDates,
} from "@/lib/utils/period";

export const metadata: Metadata = {
  title: "Keuangan — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = {
  searchParams: Promise<{ periode?: string; type?: string }>;
};

function filterHref(periode: string | undefined, type?: string): string {
  const params = new URLSearchParams();
  if (periode) params.set("periode", periode);
  if (type) params.set("type", type);
  const query = params.toString();
  return query ? `/admin/keuangan?${query}` : "/admin/keuangan";
}

/** Pencatatan & pemantauan kas (RULES.md §16). */
export default async function AdminFinancePage({ searchParams }: PageProps) {
  await requireMenu("finance");
  const params = await searchParams;

  const current = currentPeriod();
  const selectedPeriod = isValidPeriodKey(params.periode) ? getPeriod(params.periode) : null;
  const showAll = params.periode === "semua";
  const period = selectedPeriod ?? current;
  const from = showAll ? undefined : period.start;
  const to = showAll ? undefined : period.end;
  const type = params.type === "income" || params.type === "expense" ? params.type : undefined;

  // Berurutan agar pool koneksi kecil tidak macet saat banyak query serentak.
  const entries = await getFinanceEntries({ type, from, to });
  const transfers = type ? [] : await getFinanceTransfers(from, to);
  const totals = await getFinanceTotals(from, to);
  const sessions = await getPlaySessions();
  const members = await getMemberOptions();
  const periodKeys = await getFinancePeriodKeys();

  const sessionOptions = sessions.map((session) => ({
    id: session.id,
    title: session.title,
  }));
  const memberOptions = members.map((member) => ({
    id: member.id,
    name: member.nickname || member.displayName,
    avatarKey: member.avatarKey,
    avatarUrl: member.avatarUrl,
  }));

  return (
    <Container size="xl">
      <header>
        <p className="text-xs uppercase tracking-[0.04em] text-primary">Admin</p>
        <h1 className="mt-1 font-display text-4xl text-text">Keuangan</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Catat iuran sesi, pemasukan kas, dan pengeluaran seperti shuttlecock atau sewa lapangan.
          Semua transaksi terlihat oleh anggota di area member.
        </p>
      </header>

      <FinanceSummary
        totals={totals}
        caption={`${showAll ? "All of time" : period.label} · Cash + Rekening Bank`}
        className="mt-8"
      />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <MonthFilter
          action="/admin/keuangan"
          value={showAll ? "semua" : period.key}
          options={periodOptionsFromDates(periodKeys.map((key) => getPeriod(key).start))}
          allOption={{ value: "semua", label: "Semua bulan" }}
          hiddenParams={{ type }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterLink href={filterHref(params.periode)} active={!type}>
            Semua Jenis
          </FilterLink>
          <FilterLink href={filterHref(params.periode, "income")} active={type === "income"}>
            Pemasukan
          </FilterLink>
          <FilterLink href={filterHref(params.periode, "expense")} active={type === "expense"}>
            Pengeluaran
          </FilterLink>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <aside className="order-first self-start rounded-lg border border-border bg-surface p-6 lg:order-2 lg:sticky lg:top-6">
          <h2 className="text-lg font-semibold text-text">Input Keuangan</h2>
          <p className="mt-1 text-sm text-text-muted">
            Catat satu transaksi, atau iuran massal sekaligus untuk anggota yang sudah bayar.
          </p>
          <div className="mt-5">
            <FinanceEntryTabs sessions={sessionOptions} members={memberOptions} />
          </div>
        </aside>

        <section className="lg:order-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-text">Buku Kas ({entries.length})</h2>
            <p className="text-xs uppercase tracking-[0.04em] text-text-muted">
              {showAll ? "All of time" : period.label}
            </p>
          </div>
          <div className="mt-4">
            <FinanceLedger entries={entries} transfers={transfers} manage />
          </div>
        </section>
      </div>
    </Container>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-pill bg-primary px-4 py-1.5 text-sm font-semibold text-on-primary"
          : "rounded-pill border border-border px-4 py-1.5 text-sm text-text-muted transition hover:bg-surface-hover hover:text-text"
      }
    >
      {children}
    </Link>
  );
}
