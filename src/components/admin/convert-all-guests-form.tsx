"use client";

import { useActionState, useState } from "react";

import { convertAllGuestsAction } from "@/actions/guests";
import { Button } from "@/components/ui/button";
import { INITIAL_CONVERT_ALL_STATE } from "@/lib/forms/states";

/** Tombol konversi semua BaturanNgabinton jadi anggota sekaligus, dengan konfirmasi. */
export function ConvertAllGuestsForm({ guestCount }: { guestCount: number }) {
  const [state, formAction, isPending] = useActionState(
    convertAllGuestsAction,
    INITIAL_CONVERT_ALL_STATE,
  );
  const [confirming, setConfirming] = useState(false);
  const hasResult = state.ok && (state.created.length > 0 || state.linked.length > 0);
  const showConfirm = confirming && !hasResult;

  return (
    <div className="flex flex-col gap-4">
      {showConfirm ? (
        <form action={formAction} className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-text-secondary">
            Jadikan {guestCount} nama BaturanNgabinton sebagai anggota? Riwayat game & EXP ikut
            terbawa.
          </p>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Memproses..." : "Ya, konversi semua"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
            disabled={isPending}
          >
            Batal
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          size="sm"
          onClick={() => setConfirming(true)}
          disabled={guestCount === 0}
        >
          Jadikan Semua Anggota
        </Button>
      )}

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      {hasResult ? (
        <div
          role="status"
          className="rounded-md border border-border bg-surface p-4 text-sm text-text-secondary"
        >
          <p className="font-semibold text-text">Konversi selesai.</p>

          {state.created.length > 0 ? (
            <>
              <p className="mt-3 text-text-muted">
                Akun baru ({state.created.length}) — simpan username & password ini:
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {state.created.map((entry) => (
                  <li key={entry} className="font-mono text-xs">
                    {entry}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {state.linked.length > 0 ? (
            <>
              <p className="mt-3 text-text-muted">
                Ditautkan ke anggota yang sudah ada ({state.linked.length}):
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {state.linked.map((entry) => (
                  <li key={entry} className="text-xs">
                    {entry}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
