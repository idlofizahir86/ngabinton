"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  createFinanceEntryAction,
  updateFinanceEntryAction,
} from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FINANCE_CATEGORIES,
  FINANCE_CATEGORY_LABELS,
  FINANCE_PAYMENT_METHOD_LABELS,
  FINANCE_PAYMENT_METHODS,
  type FinancePaymentMethod,
} from "@/lib/constants";
import { INITIAL_FINANCE_STATE } from "@/lib/forms/states";
import { toDateTimeLocalWib } from "@/lib/utils/format";

export type FinanceSessionOption = {
  id: string;
  title: string;
};

export type FinanceMemberOption = {
  id: number;
  name: string;
};

export type FinanceEntryValues = {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  paymentMethod: FinancePaymentMethod;
  payerId: number | null;
  occurredAt: Date;
  sessionId: string | null;
};

export type FinanceEntryFormProps = {
  sessions: FinanceSessionOption[];
  members: FinanceMemberOption[];
  entry?: FinanceEntryValues;
};

const SELECT_CLASSES =
  "w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text transition duration-150 ease-brand focus:border-primary focus:outline-none focus:shadow-focus";

/** Form catat/ubah transaksi keuangan (RULES.md §16). */
export function FinanceEntryForm({ sessions, members, entry }: FinanceEntryFormProps) {
  const isEdit = Boolean(entry);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateFinanceEntryAction : createFinanceEntryAction,
    INITIAL_FINANCE_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  const [type, setType] = useState<"income" | "expense">(entry?.type ?? "income");
  const categories = FINANCE_CATEGORIES[type];
  const [category, setCategory] = useState<string>(entry?.category ?? categories[0]);

  useEffect(() => {
    if (!isEdit && state.ok) {
      formRef.current?.reset();
      setType("income");
      setCategory(FINANCE_CATEGORIES.income[0]);
    }
  }, [isEdit, state.ok]);

  const categoryOptions = (categories as readonly string[]).includes(category)
    ? categories
    : [category, ...categories];

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5" noValidate>
      {entry ? <input type="hidden" name="entryId" value={entry.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Jenis</Label>
          <select
            id="type"
            name="type"
            className={SELECT_CLASSES}
            value={type}
            onChange={(event) => {
              const next = event.target.value === "expense" ? "expense" : "income";
              setType(next);
              setCategory(FINANCE_CATEGORIES[next][0]);
            }}
          >
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Nominal (Rp)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="150000"
            defaultValue={entry?.amount ?? ""}
            required
          />
          <p className="text-xs text-text-muted">Tanpa titik, contoh: 150000.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Keterangan</Label>
        <Input
          id="description"
          name="description"
          placeholder="Iuran sesi 12 Oktober / Beli 2 tabung shuttlecock"
          defaultValue={entry?.description ?? ""}
          maxLength={200}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Kategori</Label>
          <select
            id="category"
            name="category"
            className={SELECT_CLASSES}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categoryOptions.map((value) => (
              <option key={value} value={value}>
                {FINANCE_CATEGORY_LABELS[value] ?? value}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="occurredAt">Tanggal &amp; Jam (WIB)</Label>
          <Input
            id="occurredAt"
            name="occurredAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalWib(entry?.occurredAt ?? new Date())}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            className={SELECT_CLASSES}
            defaultValue={entry?.paymentMethod ?? "cash"}
          >
            {FINANCE_PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {FINANCE_PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="payerUserId">Anggota Pembayar (opsional)</Label>
          <select
            id="payerUserId"
            name="payerUserId"
            className={SELECT_CLASSES}
            defaultValue={entry?.payerId ?? ""}
          >
            <option value="">Tidak terkait anggota</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted">
            Isi kalau transaksi ini iuran/pembayaran dari anggota tertentu.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="playSessionId">Terkait Sesi Bermain (opsional)</Label>
        <select
          id="playSessionId"
          name="playSessionId"
          className={SELECT_CLASSES}
          defaultValue={entry?.sessionId ?? ""}
        >
          <option value="">Tidak terkait sesi (kas di luar sesi)</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.title}
            </option>
          ))}
        </select>
        <p className="text-xs text-text-muted">
          Isi kalau transaksi ini iuran atau biaya sesi bermain. Kosongkan untuk kas umum.
        </p>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok && !isEdit ? (
        <p role="status" className="text-sm text-live">
          Transaksi tersimpan.
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Catat Transaksi"}
        </Button>
      </div>
    </form>
  );
}
