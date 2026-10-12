"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";

import { removeAvatarAction, uploadAvatarAction } from "@/actions/avatar";
import { MemberAvatar } from "@/components/member/member-avatar";
import { Button, buttonClass } from "@/components/ui/button";
import { INITIAL_AVATAR_STATE } from "@/lib/forms/states";

export type AvatarPhotoFormProps = {
  name: string;
  avatarKey: string | null;
  avatarUrl: string | null;
};

/** Upload / hapus foto avatar anggota (COMPONENTS.md §7.4). */
export function AvatarPhotoForm({ name, avatarKey, avatarUrl }: AvatarPhotoFormProps) {
  const [state, formAction, isPending] = useActionState(uploadAvatarAction, INITIAL_AVATAR_STATE);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <MemberAvatar name={name} avatarKey={avatarKey} avatarUrl={avatarUrl} size="lg" />
        <div className="text-sm">
          <p className="font-semibold text-text">Foto profil</p>
          <p className="text-text-muted">
            JPG, PNG, atau WebP · maks 5MB. Otomatis dipotong persegi.
          </p>
        </div>
      </div>

      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp"
          required
          aria-label="Pilih foto avatar"
          className="text-sm text-text-muted file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-surface-hover file:px-4 file:py-2 file:text-sm file:font-semibold file:text-text hover:file:brightness-125"
        />
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "Mengunggah..." : "Unggah Foto"}
        </Button>
      </form>

      {avatarUrl ? (
        <form action={removeAvatarAction}>
          <button type="submit" className={buttonClass("danger", "sm")}>
            <Trash2 className="h-4 w-4" /> Hapus foto
          </button>
        </form>
      ) : null}

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          Foto profil diperbarui.
        </p>
      ) : null}
    </div>
  );
}
