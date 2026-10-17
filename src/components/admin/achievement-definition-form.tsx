"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createAchievementDefinitionAction,
  updateAchievementDefinitionAction,
} from "@/actions/achievement-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ACHIEVEMENT_ICONS,
  ACHIEVEMENT_TONE_LABELS,
  ACHIEVEMENT_TONES,
} from "@/lib/constants";
import { INITIAL_DEFINITION_STATE } from "@/lib/forms/states";

const SELECT_CLASSES =
  "w-full rounded-md border border-border bg-surface px-4 py-3 text-base text-text transition duration-150 ease-brand focus:border-primary focus:outline-none focus:shadow-focus";

export type AchievementDefinitionValues = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string;
  tone: string;
};

export type AchievementDefinitionFormProps = {
  definition?: AchievementDefinitionValues;
};

/** Form buat/ubah badge kustom (RULES.md §13.7). */
export function AchievementDefinitionForm({ definition }: AchievementDefinitionFormProps) {
  const isEdit = Boolean(definition);
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateAchievementDefinitionAction : createAchievementDefinitionAction,
    INITIAL_DEFINITION_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isEdit && state.ok) formRef.current?.reset();
  }, [isEdit, state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5" noValidate>
      {definition ? (
        <input type="hidden" name="definitionId" value={definition.id} />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="badgeCode">Kode</Label>
          <Input
            id="badgeCode"
            name="code"
            defaultValue={definition?.code ?? ""}
            placeholder="juara_internal"
            readOnly={isEdit}
            required
          />
          <p className="text-xs text-text-muted">
            {isEdit
              ? "Kode tidak bisa diubah."
              : "Huruf kecil, angka, underscore. Unik, dipakai internal."}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="badgeName">Nama Badge</Label>
          <Input
            id="badgeName"
            name="name"
            defaultValue={definition?.name ?? ""}
            placeholder="Juara Internal"
            minLength={3}
            maxLength={60}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="badgeDescription">Deskripsi / Aturan</Label>
        <Input
          id="badgeDescription"
          name="description"
          defaultValue={definition?.description ?? ""}
          placeholder="Diberikan karena…"
          maxLength={200}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="badgeIcon">Ikon</Label>
          <select
            id="badgeIcon"
            name="icon"
            className={SELECT_CLASSES}
            defaultValue={definition?.icon ?? "award"}
          >
            {ACHIEVEMENT_ICONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="badgeTone">Warna</Label>
          <select
            id="badgeTone"
            name="tone"
            className={SELECT_CLASSES}
            defaultValue={definition?.tone ?? "primary"}
          >
            {ACHIEVEMENT_TONES.map((tone) => (
              <option key={tone} value={tone}>
                {ACHIEVEMENT_TONE_LABELS[tone]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          {isEdit ? "Badge tersimpan." : "Badge baru dibuat."}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Badge"}
        </Button>
      </div>
    </form>
  );
}
