"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";

import { deleteSessionAction } from "@/actions/match";
import { buttonClass } from "@/components/ui/button";
import { INITIAL_SESSION_STATE } from "@/lib/forms/states";

export type DeleteSessionButtonProps = {
  sessionId: string;
  /** Jumlah game tercatat — kalau > 0 tombol dinonaktifkan (RULES.md §13.1). */
  gameCount: number;
};

/**
 * Tombol hapus sesi dengan konfirmasi.
 * Dinonaktifkan bila sudah ada game tercatat; server juga menolak (guard ganda).
 */
export function DeleteSessionButton({ sessionId, gameCount }: DeleteSessionButtonProps) {
  const [state, formAction, pending] = useActionState(deleteSessionAction, INITIAL_SESSION_STATE);
  const blocked = gameCount > 0;

  return (
    <div className="flex flex-col items-start gap-2">
      <form action={formAction}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <button
          type="submit"
          disabled={blocked || pending}
          onClick={(event) => {
            if (!window.confirm("Yakin hapus sesi ini? Tindakan ini tidak bisa dibatalkan.")) {
              event.preventDefault();
            }
          }}
          title={blocked ? "Tidak bisa dihapus: sudah ada game tercatat" : undefined}
          className={buttonClass(
            "danger",
            "sm",
            blocked ? "cursor-not-allowed opacity-50" : undefined,
          )}
        >
          <Trash2 className="h-4 w-4" />
          {pending ? "Menghapus..." : "Hapus Sesi"}
        </button>
      </form>

      {blocked ? (
        <p className="text-xs text-text-muted">
          Tidak bisa dihapus: sudah ada {gameCount} game tercatat. Hapus semua game dulu.
        </p>
      ) : null}
      {state.error ? (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
