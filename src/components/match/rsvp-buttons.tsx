"use client";

import { Check } from "lucide-react";
import { useFormStatus } from "react-dom";

import { setRsvpAction } from "@/actions/rsvp";
import { RSVP_LABELS, type RsvpChoice } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

function RsvpButton({ choice, active }: { choice: RsvpChoice; active: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="choice"
      value={choice}
      disabled={pending}
      aria-pressed={active}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition duration-150 ease-brand disabled:opacity-60",
        active
          ? choice === "hadir"
            ? "border-live bg-live/15 text-live"
            : "border-warning bg-warning/15 text-warning"
          : "border-border-strong text-text hover:bg-surface-hover",
      )}
    >
      {active ? <Check className="h-4 w-4" aria-hidden /> : null}
      {RSVP_LABELS[choice]}
    </button>
  );
}

export type RsvpButtonsProps = {
  sessionId: string;
  /** Pilihan user saat ini (null = belum memilih). */
  currentChoice: RsvpChoice | null;
};

/** Tombol polling kehadiran (COMPONENTS.md §7.10). */
export function RsvpButtons({ sessionId, currentChoice }: RsvpButtonsProps) {
  return (
    <form action={setRsvpAction} className="flex gap-2">
      <input type="hidden" name="sessionId" value={sessionId} />
      <RsvpButton choice="hadir" active={currentChoice === "hadir"} />
      <RsvpButton choice="skip" active={currentChoice === "skip"} />
    </form>
  );
}
