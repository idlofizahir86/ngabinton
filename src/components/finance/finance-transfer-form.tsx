"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowLeftRight } from "lucide-react";

import { createFinanceTransferAction } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FINANCE_PAYMENT_METHOD_LABELS,
  type FinancePaymentMethod,
} from "@/lib/constants";
import { INITIAL_TRANSFER_STATE } from "@/lib/forms/states";
import { toDateTimeLocalWib } from "@/lib/utils/format";

const SELECT_CLASSES =
  "w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text transition duration-150 ease-brand focus:border-primary focus:outline-none focus:shadow-focus";

const METHODS: FinancePaymentMethod[] = ["cash", "transfer"];

/** Form pindah dana Cash ↔ Rekening Bank (RULES.md §16). */
export function FinanceTransferForm() {
  const [state, formAction, isPending] = useActionState(
    createFinanceTransferAction,
    INITIAL_TRANSFER_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [from, setFrom] = useState<FinancePaymentMethod>("cash");
  const [to, setTo] = useState<FinancePaymentMethod>("transfer");

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setFrom("cash");
      setTo("transfer");
    }
  }, [state.ok]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fromMethod">Dari</Label>
          <select
            id="fromMethod"
            name="fromMethod"
            className={SELECT_CLASSES}
            value={from}
            onChange={(event) =>
              setFrom(event.target.value === "transfer" ? "transfer" : "cash")
            }
          >
            {METHODS.map((method) => (
              <option key={method} value={method}>
                {FINANCE_PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={swap}
          aria-label="Tukar dompet asal dan tujuan"
          className="mb-0.5 inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-text-muted transition hover:bg-surface-hover hover:text-text"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-2">
          <Label htmlFor="toMethod">Ke</Label>
          <select
            id="toMethod"
            name="toMethod"
            className={SELECT_CLASSES}
            value={to}
            onChange={(event) => setTo(event.target.value === "transfer" ? "transfer" : "cash")}
          >
            {METHODS.map((method) => (
              <option key={method} value={method}>
                {FINANCE_PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="transferAmount">Nominal (Rp)</Label>
          <Input
            id="transferAmount"
            name="amount"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="100000"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="transferDate">Tanggal &amp; Jam (WIB)</Label>
          <Input
            id="transferDate"
            name="occurredAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalWib(new Date())}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="transferNote">Keterangan</Label>
        <Input
          id="transferNote"
          name="description"
          maxLength={200}
          placeholder="Setor cash ke rekening / tarik tunai untuk beli kok"
          required
        />
        <p className="text-xs text-text-muted">
          Pindah dana tidak mengubah total Saldo Kas — hanya komposisi Cash dan Rekening Bank.
        </p>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          Pindah dana tersimpan.
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Pindahkan Dana"}
        </Button>
      </div>
    </form>
  );
}
