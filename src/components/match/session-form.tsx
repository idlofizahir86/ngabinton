"use client";

import { useActionState } from "react";

import { createSessionAction } from "@/actions/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_SESSION_STATE } from "@/lib/forms/states";

/** Form buat sesi bermain baru (COMPONENTS.md §7.4). */
export function SessionForm() {
  const [state, formAction, isPending] = useActionState(
    createSessionAction,
    INITIAL_SESSION_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Judul Sesi</Label>
        <Input
          id="title"
          name="title"
          placeholder="Sesi Ngabinton"
          required
          maxLength={80}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="playedAt">Mulai</Label>
          <Input id="playedAt" name="playedAt" type="datetime-local" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endedAt">Selesai (opsional)</Label>
          <Input id="endedAt" name="endedAt" type="datetime-local" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Lokasi (opsional)</Label>
        <Input id="location" name="location" placeholder="GOR ... " maxLength={80} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Input id="notes" name="notes" maxLength={200} />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Buat Sesi"}
      </Button>
    </form>
  );
}
