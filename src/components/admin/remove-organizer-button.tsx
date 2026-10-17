"use client";

import { X } from "lucide-react";

import { removeEventOrganizerAction } from "@/actions/achievement-admin";

export type RemoveOrganizerButtonProps = {
  organizerId: number;
  label: string;
};

/** Cabut status EO event. */
export function RemoveOrganizerButton({ organizerId, label }: RemoveOrganizerButtonProps) {
  return (
    <form
      action={removeEventOrganizerAction}
      onSubmit={(event) => {
        if (!window.confirm(`Cabut status EO ${label}?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="organizerId" value={organizerId} />
      <button
        type="submit"
        aria-label={`Cabut EO ${label}`}
        className="rounded-md p-2 text-text-muted transition hover:bg-danger/10 hover:text-danger"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}
