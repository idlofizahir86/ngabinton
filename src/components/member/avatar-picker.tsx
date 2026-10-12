"use client";

import { useState } from "react";

import { MemberAvatar } from "@/components/member/member-avatar";
import { Label } from "@/components/ui/label";
import { AVATAR_PRESETS } from "@/lib/members/avatars";
import { cn } from "@/lib/utils/cn";

export type AvatarPickerProps = {
  /** Nilai awal (kunci preset). */
  defaultValue: string;
  /** Nama yang dipakai untuk monogram di pratinjau. */
  previewName: string;
  /** Nama field hidden input (default `avatarKey`). */
  fieldName?: string;
};

/** Pemilih avatar preset: hidden input + grid pratinjau (COMPONENTS.md §7.3). */
export function AvatarPicker({ defaultValue, previewName, fieldName = "avatarKey" }: AvatarPickerProps) {
  const [avatarKey, setAvatarKey] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label>Avatar Preset</Label>
        <p className="mt-1 text-xs text-text-muted">Dipakai kalau tidak ada foto yang diunggah.</p>
      </div>

      <input type="hidden" name={fieldName} value={avatarKey} />

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
        {AVATAR_PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => setAvatarKey(preset.key)}
            aria-pressed={avatarKey === preset.key}
            aria-label={preset.label}
            className={cn(
              "flex items-center justify-center rounded-md border p-3 transition duration-150 ease-brand",
              avatarKey === preset.key
                ? "border-primary bg-surface-hover"
                : "border-border hover:bg-surface-hover",
            )}
          >
            <MemberAvatar name={previewName} avatarKey={preset.key} size="md" />
          </button>
        ))}
      </div>
    </div>
  );
}
