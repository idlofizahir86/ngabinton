"use client";

import { useActionState, useState } from "react";

import { updateProfileAction } from "@/actions/member";
import { MemberAvatar } from "@/components/member/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_PROFILE_STATE } from "@/lib/forms/states";
import { AVATAR_PRESETS } from "@/lib/members/avatars";
import { cn } from "@/lib/utils/cn";

export type ProfileFormProps = {
  initial: {
    displayName: string;
    nickname: string;
    waNumber: string;
    avatarKey: string;
  };
};

/** Form edit profil anggota + pemilih avatar (COMPONENTS.md §7.3). */
export function ProfileForm({ initial }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, INITIAL_PROFILE_STATE);
  const [avatarKey, setAvatarKey] = useState(initial.avatarKey);
  const previewName = initial.nickname || initial.displayName;

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      <section className="flex flex-col gap-3">
        <div>
          <Label>Avatar Preset</Label>
          <p className="mt-1 text-xs text-text-muted">
            Dipakai kalau tidak ada foto yang diunggah.
          </p>
        </div>
        <input type="hidden" name="avatarKey" value={avatarKey} />
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
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="displayName">Nama</Label>
          <Input id="displayName" name="displayName" defaultValue={initial.displayName} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nickname">Nama Punggung</Label>
          <Input
            id="nickname"
            name="nickname"
            defaultValue={initial.nickname}
            placeholder="Tampil di Pang-Giatna Ngabinton"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="waNumber">Nomor WhatsApp</Label>
          <Input
            id="waNumber"
            name="waNumber"
            inputMode="tel"
            defaultValue={initial.waNumber}
            placeholder="081234567890"
          />
          <p className="text-xs text-text-muted">
            Bisa dipakai untuk login sebagai pengganti username.
          </p>
        </div>
      </section>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          Profil tersimpan.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Menyimpan..." : "Simpan Profil"}
      </Button>
    </form>
  );
}
