"use client";

import { useActionState, useEffect, useRef } from "react";

import { awardCustomAchievementAction } from "@/actions/achievement-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_AWARD_STATE } from "@/lib/forms/states";

const SELECT_CLASSES =
  "w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text transition duration-150 ease-brand focus:border-primary focus:outline-none focus:shadow-focus";

export type CustomAwardFormProps = {
  members: { id: number; name: string }[];
  definitions: { id: string; name: string }[];
};

/** Form beri badge kustom ke seorang anggota (RULES.md §13.7). */
export function CustomAwardForm({ members, definitions }: CustomAwardFormProps) {
  const [state, formAction, isPending] = useActionState(
    awardCustomAchievementAction,
    INITIAL_AWARD_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="awardMember">Anggota</Label>
        <select id="awardMember" name="memberId" className={SELECT_CLASSES} required>
          <option value="">Pilih anggota…</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="awardDefinition">Badge</Label>
        <select id="awardDefinition" name="definitionId" className={SELECT_CLASSES} required>
          <option value="">Pilih badge…</option>
          {definitions.map((definition) => (
            <option key={definition.id} value={definition.id}>
              {definition.name}
            </option>
          ))}
        </select>
        {definitions.length === 0 ? (
          <p className="text-xs text-warning">Belum ada badge aktif. Buat badge dulu.</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="awardNote">Catatan (opsional)</Label>
        <Input
          id="awardNote"
          name="note"
          maxLength={200}
          placeholder="Alasan pemberian badge"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          Badge berhasil diberikan.
        </p>
      ) : null}
      {state.duplicate ? (
        <p role="status" className="text-sm text-warning">
          Anggota ini sudah punya badge tersebut.
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending || definitions.length === 0}>
          {isPending ? "Menyimpan..." : "Beri Badge"}
        </Button>
      </div>
    </form>
  );
}
