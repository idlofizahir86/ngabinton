"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { createBulkSessionDuesAction } from "@/actions/finance";
import { MemberAvatar } from "@/components/member/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionDuesRow } from "@/lib/api/session-dues";
import {
  FINANCE_PAYMENT_METHOD_LABELS,
  FINANCE_PAYMENT_METHODS,
} from "@/lib/constants";
import { INITIAL_BULK_DUES_STATE } from "@/lib/forms/states";
import { formatRupiah, toDateTimeLocalWib } from "@/lib/utils/format";

export type SessionDuesPanelProps = {
  sessionId: string;
  sessionTitle: string;
  rows: SessionDuesRow[];
};

const SELECT_CLASSES =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text transition duration-150 ease-brand focus:border-primary focus:outline-none focus:shadow-focus";

/** Catat iuran sesi untuk anggota yang hadir, langsung dari halaman sesi. */
export function SessionDuesPanel({ sessionId, sessionTitle, rows }: SessionDuesPanelProps) {
  const [state, formAction, isPending] = useActionState(
    createBulkSessionDuesAction,
    INITIAL_BULK_DUES_STATE,
  );

  const unpaidKeys = useMemo(
    () => rows.filter((row) => row.paidAmount === 0).map((row) => row.key),
    [rows],
  );
  const [selected, setSelected] = useState<string[]>(unpaidKeys);

  useEffect(() => {
    // Sinkronkan pilihan setelah server menyimpan iuran (props baru).
    setSelected(unpaidKeys);
  }, [unpaidKeys]);

  function toggle(key: string) {
    setSelected((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="sessionId" value={sessionId} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sessionDuesAmount">Nominal per Anggota (Rp)</Label>
          <Input
            id="sessionDuesAmount"
            name="amount"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="20000"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sessionDuesMethod">Metode</Label>
          <select
            id="sessionDuesMethod"
            name="paymentMethod"
            className={SELECT_CLASSES}
            defaultValue="cash"
          >
            {FINANCE_PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {FINANCE_PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sessionDuesDate">Tanggal &amp; Jam (WIB)</Label>
          <Input
            id="sessionDuesDate"
            name="occurredAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalWib(new Date())}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Hadir ({rows.length})</Label>
        <ul className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {rows.map((row) => {
            const paid = row.paidAmount > 0;
            const checked = !paid && selected.includes(row.key);
            const inputName = row.isGuest ? "guestNames" : "memberIds";
            const inputValue = row.isGuest
              ? (row.guestName ?? row.name)
              : String(row.userId ?? "");

            return (
              <li key={row.key}>
                <label
                  className={
                    paid
                      ? "flex cursor-default items-center gap-3 rounded-md border border-border bg-background-elevated p-2.5 opacity-80"
                      : checked
                        ? "flex cursor-pointer items-center gap-3 rounded-md border border-primary/60 bg-primary/10 p-2.5"
                        : "flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background-elevated p-2.5 transition hover:bg-surface-hover"
                  }
                >
                  <input
                    type="checkbox"
                    name={inputName}
                    value={inputValue}
                    checked={checked}
                    disabled={paid}
                    onChange={() => toggle(row.key)}
                    className="h-4 w-4 accent-primary"
                  />
                  <MemberAvatar
                    name={row.name}
                    avatarKey={row.avatarKey}
                    avatarUrl={row.avatarUrl}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-text">
                      {row.name}
                      {row.isGuest ? (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.04em] text-text-muted">
                          Baturan
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-[10px] uppercase tracking-[0.04em] text-text-subtle">
                      {paid ? `Sudah bayar ${formatRupiah(row.paidAmount)}` : "Belum bayar"}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sessionDuesNote">Catatan (opsional)</Label>
        <Input
          id="sessionDuesNote"
          name="description"
          maxLength={120}
          placeholder={`Kosongkan untuk otomatis: Iuran ${sessionTitle}`}
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          {state.created > 0
            ? `${state.created} iuran tersimpan${state.skipped > 0 ? `, ${state.skipped} dilewati karena sudah tercatat` : ""}.`
            : `Tidak ada yang disimpan — ${state.skipped} anggota terpilih sudah tercatat di sesi ini.`}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending || selected.length === 0}>
          {isPending ? "Menyimpan..." : `Simpan ${selected.length} Iuran`}
        </Button>
      </div>
    </form>
  );
}
