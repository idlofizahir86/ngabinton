"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/actions/member";
import { AvatarPicker } from "@/components/member/avatar-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_PROFILE_STATE } from "@/lib/forms/states";

export type ProfileFormProps = {
  initial: {
    displayName: string;
    nickname: string;
    waNumber: string;
    email: string;
    avatarKey: string;
  };
};

/** Form edit profil anggota + pemilih avatar (COMPONENTS.md §7.3). */
export function ProfileForm({ initial }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, INITIAL_PROFILE_STATE);
  const previewName = initial.nickname || initial.displayName;

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      <AvatarPicker defaultValue={initial.avatarKey} previewName={previewName} />

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

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            defaultValue={initial.email}
            placeholder="nama@email.com"
          />
          <p className="text-xs text-text-muted">
            Dipakai untuk notifikasi email dari pengurus (opsional).
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
