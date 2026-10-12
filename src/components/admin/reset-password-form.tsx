"use client";

import { useActionState, useState } from "react";

import { resetMemberPasswordAction } from "@/actions/admin-members";
import { Button } from "@/components/ui/button";
import { INITIAL_RESET_PASSWORD_STATE } from "@/lib/forms/states";

export type ResetPasswordFormProps = {
  memberId: number;
  username: string;
};

/** Tombol reset password anggota ke default `{username}ngabinton`, dengan konfirmasi. */
export function ResetPasswordForm({ memberId, username }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(
    resetMemberPasswordAction,
    INITIAL_RESET_PASSWORD_STATE,
  );
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {confirming ? (
        <form action={formAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="memberId" value={memberId} />
          <p className="text-sm text-text-secondary">
            Reset password <span className="font-mono">@{username}</span> ke default?
          </p>
          <Button type="submit" variant="danger" size="sm" disabled={isPending}>
            {isPending ? "Memproses..." : "Ya, reset"}
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
        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          Reset Password ke Default
        </Button>
      )}

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.password ? (
        <p role="status" className="rounded-md border border-border bg-surface-hover p-4 text-sm text-text">
          Password baru: <span className="font-mono font-semibold">{state.password}</span> — beri
          tahu anggotanya untuk segera menggantinya di halaman Profil.
        </p>
      ) : null}
    </div>
  );
}
