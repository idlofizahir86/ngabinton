"use client";

import { useActionState } from "react";

import { convertGuestAction } from "@/actions/admin-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_CONVERT_STATE } from "@/lib/forms/states";

export type GuestConvertFormProps = {
  guestName: string;
};

/** Form konversi tamu (baturan) menjadi anggota club. */
export function GuestConvertForm({ guestName }: GuestConvertFormProps) {
  const [state, formAction, isPending] = useActionState(convertGuestAction, INITIAL_CONVERT_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <input type="hidden" name="guestName" value={guestName} />
      <p className="text-xs uppercase tracking-[0.04em] text-text-muted">Jadikan anggota</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`username-${guestName}`}>Username</Label>
          <Input
            id={`username-${guestName}`}
            name="username"
            placeholder="username"
            pattern="[a-z0-9_]+"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`displayName-${guestName}`}>Nama</Label>
          <Input id={`displayName-${guestName}`} name="displayName" defaultValue={guestName} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`nickname-${guestName}`}>Nama Punggung</Label>
          <Input id={`nickname-${guestName}`} name="nickname" />
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Password awal: <span className="font-mono">username + ngabinton</span>. Anggota bisa
        menggantinya nanti.
      </p>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          Tamu berhasil menjadi anggota.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} variant="ghost" className="w-full sm:w-auto">
        {isPending ? "Memproses..." : "Jadikan Anggota"}
      </Button>
    </form>
  );
}
