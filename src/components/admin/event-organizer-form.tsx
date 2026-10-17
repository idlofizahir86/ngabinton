"use client";

import { useActionState, useEffect, useRef } from "react";

import { assignEventOrganizerAction } from "@/actions/achievement-admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { INITIAL_ORGANIZER_STATE } from "@/lib/forms/states";

const SELECT_CLASSES =
  "w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text transition duration-150 ease-brand focus:border-primary focus:outline-none focus:shadow-focus";

export type EventOrganizerFormProps = {
  events: { id: string; title: string }[];
  members: { id: number; name: string }[];
};

/** Form assign EO event (RULES.md §13.8). */
export function EventOrganizerForm({ events, members }: EventOrganizerFormProps) {
  const [state, formAction, isPending] = useActionState(
    assignEventOrganizerAction,
    INITIAL_ORGANIZER_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="organizerEvent">Event</Label>
        <select
          id="organizerEvent"
          name="eventId"
          className={SELECT_CLASSES}
          defaultValue={events[0]?.id ?? ""}
          required
        >
          {events.length === 0 ? <option value="">Belum ada event</option> : null}
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="organizerMember">Anggota</Label>
        <select
          id="organizerMember"
          name="memberId"
          className={SELECT_CLASSES}
          defaultValue=""
          required
        >
          <option value="" disabled>
            Pilih anggota…
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          EO ditambahkan. Badge event otomatis diperbarui.
        </p>
      ) : null}

      <div>
        <Button
          type="submit"
          disabled={isPending || events.length === 0 || members.length === 0}
        >
          {isPending ? "Menyimpan..." : "Tambah EO"}
        </Button>
      </div>
    </form>
  );
}
