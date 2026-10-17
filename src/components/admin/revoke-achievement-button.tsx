"use client";

import { X } from "lucide-react";

import { revokeAchievementAction } from "@/actions/achievement-admin";

export type RevokeAchievementButtonProps = {
  achievementId: string;
  label: string;
};

/** Cabut satu badge kustom dari anggota. */
export function RevokeAchievementButton({
  achievementId,
  label,
}: RevokeAchievementButtonProps) {
  return (
    <form
      action={revokeAchievementAction}
      onSubmit={(event) => {
        if (!window.confirm(`Cabut badge "${label}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="achievementId" value={achievementId} />
      <button
        type="submit"
        aria-label={`Cabut badge ${label}`}
        className="rounded-md p-2 text-text-muted transition hover:bg-danger/10 hover:text-danger"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}
