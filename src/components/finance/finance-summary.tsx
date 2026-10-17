import type { FinanceTotals } from "@/lib/api/finance";
import { cn } from "@/lib/utils/cn";
import { formatRupiah } from "@/lib/utils/format";

export type FinanceSummaryProps = {
  totals: FinanceTotals;
  /** Label tambahan, mis. "Bulan Ini" atau "Sesi Ini". */
  caption?: string;
  className?: string;
};

/**
 * Ringkasan saldo kas: total, saldo cash, dan saldo rekening bank.
 * Pemasukan/pengeluaran ditampilkan sebagai catatan di bawah kartu (RULES.md §16).
 */
export function FinanceSummary({ totals, caption, className }: FinanceSummaryProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Saldo Kas" value={totals.balance} accent caption={caption} />
        <SummaryCard label="Cash" value={totals.cash.balance} />
        <SummaryCard label="Rekening Bank" value={totals.transfer.balance} />
      </div>
      <p className="mt-2 text-xs text-text-muted">
        Pemasukan {formatRupiah(totals.income)} · Pengeluaran {formatRupiah(totals.expense)} · Cash
        masuk {formatRupiah(totals.cash.income)}, keluar {formatRupiah(totals.cash.expense)} · Bank
        masuk {formatRupiah(totals.transfer.income)}, keluar {formatRupiah(totals.transfer.expense)}
      </p>
      {totals.cash.transferOut > 0 || totals.transfer.transferOut > 0 ? (
        <p className="mt-1 text-xs text-text-subtle">
          Pindah dana: Cash → Bank {formatRupiah(totals.cash.transferOut)} · Bank → Cash{" "}
          {formatRupiah(totals.transfer.transferOut)}
        </p>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent = false,
  caption,
}: {
  label: string;
  value: number;
  accent?: boolean;
  caption?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.04em] text-text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-2xl tabular-nums sm:text-3xl",
          accent ? "text-primary" : "text-text",
        )}
      >
        {formatRupiah(value)}
      </p>
      {caption ? <p className="mt-1 text-xs text-text-subtle">{caption}</p> : null}
    </div>
  );
}
