import Link from "next/link";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Pencil } from "lucide-react";

import { DeleteFinanceButton } from "@/components/finance/delete-finance-button";
import { DeleteTransferButton } from "@/components/finance/delete-transfer-button";
import type { FinanceEntryRow, FinanceTransferRow } from "@/lib/api/finance";
import {
  FINANCE_CATEGORY_LABELS,
  FINANCE_PAYMENT_METHOD_LABELS,
  FINANCE_TYPE_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatRupiah } from "@/lib/utils/format";

export type FinanceLedgerProps = {
  entries: FinanceEntryRow[];
  /** Perpindahan dana Cash ↔ Bank (opsional). */
  transfers?: FinanceTransferRow[];
  /** Tampilkan tombol ubah/hapus (halaman admin). */
  manage?: boolean;
  emptyText?: string;
};

type LedgerItem =
  | ({ kind: "entry" } & FinanceEntryRow)
  | ({ kind: "transfer" } & FinanceTransferRow);

/** Buku kas: transaksi + pindah dana, urut terbaru (RULES.md §16). */
export function FinanceLedger({
  entries,
  transfers = [],
  manage = false,
  emptyText = "Belum ada transaksi keuangan.",
}: FinanceLedgerProps) {
  const items: LedgerItem[] = [
    ...entries.map((entry) => ({ kind: "entry" as const, ...entry })),
    ...transfers.map((transfer) => ({ kind: "transfer" as const, ...transfer })),
  ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {items.map((item) => {
        if (item.kind === "transfer") {
          return (
            <li key={item.id} className="flex flex-wrap items-start gap-3 px-4 py-3 sm:px-5">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-surface-hover text-text-secondary"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text">{item.description}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                  <span>{formatDate(item.occurredAt)}</span>
                  <span aria-hidden>·</span>
                  <span className="rounded-pill bg-surface-hover px-2 py-0.5">
                    {FINANCE_PAYMENT_METHOD_LABELS[item.fromMethod]} →{" "}
                    {FINANCE_PAYMENT_METHOD_LABELS[item.toMethod]}
                  </span>
                  {item.createdByName ? <span>dicatat {item.createdByName}</span> : null}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-display text-lg tabular-nums text-text-secondary">
                  {formatRupiah(item.amount)}
                </p>
                <p className="text-[10px] uppercase tracking-[0.04em] text-text-subtle">
                  Pindah Dana
                </p>
              </div>

              {manage ? (
                <div className="flex shrink-0 items-center gap-1 self-center">
                  <DeleteTransferButton
                    transferId={item.id}
                    description={item.description}
                  />
                </div>
              ) : null}
            </li>
          );
        }

        const isIncome = item.type === "income";
        return (
          <li key={item.id} className="flex flex-wrap items-start gap-3 px-4 py-3 sm:px-5">
            <span
              aria-hidden
              className={cn(
                "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill",
                isIncome ? "bg-live/15 text-live" : "bg-danger/15 text-danger",
              )}
            >
              {isIncome ? (
                <ArrowDownLeft className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-text">{item.description}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                <span>{formatDate(item.occurredAt)}</span>
                <span aria-hidden>·</span>
                <span className="rounded-pill bg-surface-hover px-2 py-0.5">
                  {FINANCE_CATEGORY_LABELS[item.category] ?? item.category}
                </span>
                {item.sessionTitle ? (
                  <span className="rounded-pill bg-surface-hover px-2 py-0.5">
                    {item.sessionTitle}
                  </span>
                ) : null}
                <span className="rounded-pill bg-surface-hover px-2 py-0.5">
                  {FINANCE_PAYMENT_METHOD_LABELS[item.paymentMethod]}
                </span>
                {item.payerName ? (
                  <span className="rounded-pill bg-surface-hover px-2 py-0.5">
                    anggota: {item.payerName}
                  </span>
                ) : null}
                {item.createdByName ? <span>dicatat {item.createdByName}</span> : null}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p
                className={cn(
                  "font-display text-lg tabular-nums",
                  isIncome ? "text-live" : "text-danger",
                )}
              >
                {isIncome ? "+" : "−"}
                {formatRupiah(item.amount)}
              </p>
              <p className="text-[10px] uppercase tracking-[0.04em] text-text-subtle">
                {FINANCE_TYPE_LABELS[item.type]}
              </p>
            </div>

            {manage ? (
              <div className="flex shrink-0 items-center gap-1 self-center">
                <Link
                  href={`/admin/keuangan/${item.id}/edit`}
                  aria-label={`Ubah transaksi ${item.description}`}
                  className="rounded-md p-2 text-text-muted transition hover:bg-surface-hover hover:text-text"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteFinanceButton entryId={item.id} description={item.description} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
