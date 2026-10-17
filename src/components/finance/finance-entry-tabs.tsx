"use client";

import { useState } from "react";
import { ArrowLeftRight, ListPlus, ReceiptText } from "lucide-react";

import {
  FinanceEntryForm,
  type FinanceSessionOption,
} from "@/components/finance/finance-entry-form";
import { FinanceTransferForm } from "@/components/finance/finance-transfer-form";
import { SessionDuesForm, type DuesMemberOption } from "@/components/finance/session-dues-form";
import { cn } from "@/lib/utils/cn";

export type FinanceEntryTabsProps = {
  sessions: FinanceSessionOption[];
  members: DuesMemberOption[];
};

type TabKey = "dues" | "entry" | "transfer";

const TABS: { key: TabKey; label: string; icon: typeof ListPlus }[] = [
  { key: "entry", label: "Transaksi", icon: ReceiptText },
  { key: "dues", label: "Iuran Massal", icon: ListPlus },
  { key: "transfer", label: "Pindah Dana", icon: ArrowLeftRight },
];

/** Tab form keuangan: transaksi tunggal atau iuran massal per sesi (RULES.md §16). */
export function FinanceEntryTabs({ sessions, members }: FinanceEntryTabsProps) {
  const [active, setActive] = useState<TabKey>("entry");

  return (
    <div>
      <div role="tablist" aria-label="Jenis input keuangan" className="grid grid-cols-3 gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.key}`}
              id={`tab-${tab.key}`}
              onClick={() => setActive(tab.key)}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition",
                isActive
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border text-text-muted hover:bg-surface-hover hover:text-text",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="panel-entry"
        aria-labelledby="tab-entry"
        hidden={active !== "entry"}
        className="mt-5"
      >
        <FinanceEntryForm sessions={sessions} members={members} />
      </div>

      <div
        role="tabpanel"
        id="panel-dues"
        aria-labelledby="tab-dues"
        hidden={active !== "dues"}
        className="mt-5"
      >
        <SessionDuesForm sessions={sessions} members={members} />
      </div>

      <div
        role="tabpanel"
        id="panel-transfer"
        aria-labelledby="tab-transfer"
        hidden={active !== "transfer"}
        className="mt-5"
      >
        <FinanceTransferForm />
      </div>
    </div>
  );
}
