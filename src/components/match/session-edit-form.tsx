"use client";

import { useActionState } from "react";

import { updateSessionAction } from "@/actions/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_SESSION_STATE } from "@/lib/forms/states";

export type SessionEditFormProps = {
  initial: {
    id: string;
    title: string;
    location: string;
    playedAt: string;
    endedAt: string;
    notes: string;
  };
};

/** Form edit data sesi bermain (COMPONENTS.md §7.12). */
export function SessionEditForm({ initial }: SessionEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateSessionAction, INITIAL_SESSION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="sessionId" value={initial.id} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Judul Sesi</Label>
        <Input id="title" name="title" defaultValue={initial.title} required maxLength={80} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="playedAt">Mulai</Label>
          <Input
            id="playedAt"
            name="playedAt"
            type="datetime-local"
            defaultValue={initial.playedAt}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endedAt">Selesai (opsional)</Label>
          <Input id="endedAt" name="endedAt" type="datetime-local" defaultValue={initial.endedAt} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Lokasi (opsional)</Label>
        <Input
          id="location"
          name="location"
          defaultValue={initial.location}
          placeholder="GOR ..."
          maxLength={80}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Input id="notes" name="notes" defaultValue={initial.notes} maxLength={200} />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
