"use client";

import Link, { useLinkStatus } from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";

import { currentPeriod, type PeriodOption } from "@/lib/utils/period";
import { cn } from "@/lib/utils/cn";

type Mode = "month" | "all";

/** Spinner kecil saat navigasi periode sedang memuat. */
function PendingIndicator() {
  const { pending } = useLinkStatus();
  return pending ? (
    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Memuat" />
  ) : null;
}

function PeriodLink({
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
      prefetch
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-sm font-semibold transition",
        active
          ? "bg-primary text-on-primary"
          : "border border-border text-text-muted hover:bg-surface-hover hover:text-text",
      )}
    >
      {children}
      <PendingIndicator />
    </Link>
  );
}

/** Toggle periode + pemilih bulan historis dengan indikator loading. */
export function PeriodToggle({
  mode,
  periodKey,
  options,
}: {
  mode: Mode;
  periodKey: string;
  options: PeriodOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isCurrentMonth = periodKey === currentPeriod().key;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Pilih periode">
      <PeriodLink href="/leaderboard" active={mode === "month" && isCurrentMonth}>
        Bulan Ini
      </PeriodLink>
      <PeriodLink href="/leaderboard?periode=all" active={mode === "all"}>
        All Of Time
      </PeriodLink>

      <label className="ml-1 flex items-center gap-2">
        <span className="sr-only">Pilih bulan</span>
        <select
          value={mode === "all" ? "" : periodKey}
          disabled={mode === "all"}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) return;
            startTransition(() => {
              router.push(`/leaderboard?periode=${value}`, { scroll: false });
            });
          }}
          className="rounded-pill border border-border bg-surface px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none focus:shadow-focus disabled:opacity-50"
        >
          <option value="" disabled>
            Pilih bulan
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-text-muted" aria-label="Memuat" />
        ) : null}
      </label>
    </div>
  );
}
