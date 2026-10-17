"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { createBulkSessionDuesAction } from "@/actions/finance";
import { MemberAvatar } from "@/components/member/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FINANCE_PAYMENT_METHOD_LABELS,
  FINANCE_PAYMENT_METHODS,
} from "@/lib/constants";
import { INITIAL_BULK_DUES_STATE } from "@/lib/forms/states";
import { toDateTimeLocalWib } from "@/lib/utils/format";

export type DuesSessionOption = { id: string; title: string };
export type DuesMemberOption = {
  id: number;
  name: string;
  avatarKey: string | null;
  avatarUrl: string | null;
};

export type SessionDuesFormProps = {
  sessions: DuesSessionOption[];
  members: DuesMemberOption[];
};

const SELECT_CLASSES =
  "w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text transition duration-150 ease-brand focus:border-primary focus:outline-none focus:shadow-focus";

/** Input massal iuran sesi: satu transaksi per anggota terpilih (RULES.md §16). */
export function SessionDuesForm({ sessions, members }: SessionDuesFormProps) {
  const [state, formAction, isPending] = useActionState(
    createBulkSessionDuesAction,
    INITIAL_BULK_DUES_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (state.ok && state.created > 0) {
      formRef.current?.reset();
      setSelected([]);
    }
  }, [state.ok, state.created]);

  const allSelected = members.length > 0 && selected.length === members.length;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return members;
    return members.filter((member) => member.name.toLowerCase().includes(needle));
  }, [members, query]);

  function toggle(id: number) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleAll() {
    setSelected(allSelected ? [] : members.map((member) => member.id));
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="duesSession">Sesi Bermain</Label>
          <select
            id="duesSession"
            name="sessionId"
            className={SELECT_CLASSES}
            defaultValue={sessions[0]?.id ?? ""}
            required
          >
            {sessions.length === 0 ? <option value="">Belum ada sesi</option> : null}
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="duesAmount">Nominal per Anggota (Rp)</Label>
          <Input
            id="duesAmount"
            name="amount"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="20000"
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="duesMethod">Metode Pembayaran</Label>
          <select
            id="duesMethod"
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="duesDate">Tanggal &amp; Jam (WIB)</Label>
          <Input
            id="duesDate"
            name="occurredAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalWib(new Date())}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="duesNote">Catatan (opsional)</Label>
        <Input
          id="duesNote"
          name="description"
          maxLength={120}
          placeholder="Kosongkan untuk otomatis: Iuran {judul sesi}"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Anggota yang Membayar ({selected.length} dipilih)</Label>
          <button
            type="button"
            onClick={toggleAll}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            {allSelected ? "Kosongkan pilihan" : "Pilih semua"}
          </button>
        </div>

        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama anggota..."
          aria-label="Cari anggota"
        />

        <ul className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {filtered.map((member) => {
            const checked = selected.includes(member.id);
            return (
              <li key={member.id}>
                <label
                  className={
                    checked
                      ? "flex cursor-pointer items-center gap-3 rounded-md border border-primary/60 bg-primary/10 p-2.5"
                      : "flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background-elevated p-2.5 transition hover:bg-surface-hover"
                  }
                >
                  <input
                    type="checkbox"
                    name="memberIds"
                    value={member.id}
                    checked={checked}
                    onChange={() => toggle(member.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <MemberAvatar
                    name={member.name}
                    avatarKey={member.avatarKey}
                    avatarUrl={member.avatarUrl}
                    size="sm"
                  />
                  <span className="truncate text-sm text-text">{member.name}</span>
                </label>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="text-sm text-text-muted">Tidak ada anggota yang cocok.</li>
          ) : null}
        </ul>
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
        <Button type="submit" disabled={isPending || selected.length === 0 || sessions.length === 0}>
          {isPending ? "Menyimpan..." : `Simpan ${selected.length} Iuran`}
        </Button>
      </div>
    </form>
  );
}
