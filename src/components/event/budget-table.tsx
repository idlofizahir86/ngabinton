import { cn } from "@/lib/utils/cn";
import { formatDate, formatRupiah } from "@/lib/utils/format";

export type BudgetItemView = {
  label: string;
  amount: number;
  isTotal?: boolean;
};

export type BudgetPaymentInfo = {
  bank: string;
  accountNumber: string;
  accountName: string;
  deadline?: string;
};

export type BudgetTableProps = {
  items: BudgetItemView[];
  paymentInfo?: BudgetPaymentInfo;
  variant?: "cinema" | "storytelling";
};

type VariantClasses = {
  card: string;
  head: string;
  rowBorder: string;
  rowText: string;
  amount: string;
  totalBg: string;
  totalText: string;
  paymentBg: string;
  paymentBorder: string;
  paymentLabel: string;
  paymentText: string;
  paymentMuted: string;
};

const VARIANT_CLASSES: Record<"cinema" | "storytelling", VariantClasses> = {
  cinema: {
    card: "bg-surface",
    head: "text-text-subtle",
    rowBorder: "border-border",
    rowText: "text-text-secondary",
    amount: "text-text",
    totalBg: "bg-surface-hover",
    totalText: "text-text",
    paymentBg: "bg-surface",
    paymentBorder: "border-l-warning",
    paymentLabel: "text-text-subtle",
    paymentText: "text-text",
    paymentMuted: "text-text-muted",
  },
  storytelling: {
    card: "bg-story-surface",
    head: "text-story-muted",
    rowBorder: "border-story-border",
    rowText: "text-story-text-secondary",
    amount: "text-story-text",
    totalBg: "bg-story-bg-alt",
    totalText: "text-story-text",
    paymentBg: "bg-story-bg-alt",
    paymentBorder: "border-l-story-orange",
    paymentLabel: "text-story-muted",
    paymentText: "text-story-text",
    paymentMuted: "text-story-muted",
  },
};

/**
 * Tabel biaya event — COMPONENTS.md §4.5.
 * Server Component. Baris `isTotal` ditampilkan sebagai blok ringkasan (bukan `<tr>`)
 * supaya bisa ber-background + radius sesuai spesifikasi.
 */
export function BudgetTable({ items, paymentInfo, variant = "storytelling" }: BudgetTableProps) {
  const classes = VARIANT_CLASSES[variant];
  const rows = items.filter((item) => !item.isTotal);
  const total = items.find((item) => item.isTotal);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("rounded-lg p-8", classes.card)}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th
              scope="col"
              className={cn("w-8 pb-3 text-xs font-normal uppercase tracking-[0.04em]", classes.head)}
            >
              #
            </th>
            <th
              scope="col"
              className={cn("pb-3 text-xs font-normal uppercase tracking-[0.04em]", classes.head)}
            >
              Item
            </th>
            <th
              scope="col"
              className={cn(
                "pb-3 text-right text-xs font-normal uppercase tracking-[0.04em]",
                classes.head,
              )}
            >
              Jumlah
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, index) => (
            <tr key={`${index}-${item.label}`} className={cn("border-b", classes.rowBorder)}>
              <td className={cn("py-3 text-sm tabular-nums", classes.head)}>{index + 1}</td>
              <td className={cn("py-3 text-base", classes.rowText)}>{item.label}</td>
              <td className={cn("py-3 text-right font-mono text-base tabular-nums", classes.amount)}>
                {formatRupiah(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {total ? (
        <div
          className={cn("mt-4 flex items-center justify-between rounded-md px-4 py-3", classes.totalBg)}
        >
          <span className={cn("text-lg font-semibold", classes.totalText)}>{total.label}</span>
          <span className={cn("font-mono text-lg font-semibold tabular-nums", classes.totalText)}>
            {formatRupiah(total.amount)}
          </span>
        </div>
      ) : null}

      {paymentInfo ? (
        <div
          className={cn(
            "mt-6 rounded-md border-l-4 px-5 py-4",
            classes.paymentBorder,
            classes.paymentBg,
          )}
        >
          <p className={cn("text-xs uppercase tracking-[0.04em]", classes.paymentLabel)}>
            Info pembayaran
          </p>
          <p className={cn("mt-1 text-base font-semibold", classes.paymentText)}>
            {paymentInfo.bank} · {paymentInfo.accountNumber}
          </p>
          <p className={cn("text-sm", classes.paymentMuted)}>a.n. {paymentInfo.accountName}</p>
          {paymentInfo.deadline ? (
            <p className={cn("mt-1 text-sm", classes.paymentMuted)}>
              Bayar sebelum {formatDate(paymentInfo.deadline)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
