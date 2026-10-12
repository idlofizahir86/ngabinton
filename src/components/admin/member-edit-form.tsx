"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { updateMemberAction } from "@/actions/admin-members";
import { AvatarPicker } from "@/components/member/avatar-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INITIAL_MEMBER_FORM_STATE } from "@/lib/forms/states";
import { getAvatarPreset } from "@/lib/members/avatars";

export type MemberEditFormProps = {
  member: {
    id: number;
    username: string;
    displayName: string;
    nickname: string | null;
    waNumber: string | null;
    email: string | null;
    avatarKey: string | null;
    isActive: boolean;
  };
};

/** Form admin: edit data anggota (identitas, kontak, avatar, status aktif). */
export function MemberEditForm({ member }: MemberEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateMemberAction, INITIAL_MEMBER_FORM_STATE);
  const [previewName, setPreviewName] = useState(member.displayName);

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      <input type="hidden" name="memberId" value={member.id} />

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>Username</Label>
          <p className="font-mono text-sm text-text-secondary">@{member.username}</p>
          <p className="text-xs text-text-muted">
            Username tidak bisa diubah (dipakai untuk login & password default).
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="displayName">Nama</Label>
          <Input
            id="displayName"
            name="displayName"
            defaultValue={member.displayName}
            required
            onChange={(event) => setPreviewName(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nickname">Nama Punggung</Label>
          <Input
            id="nickname"
            name="nickname"
            defaultValue={member.nickname ?? ""}
            placeholder="Tampil di Pang-Giatna Ngabinton"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="waNumber">Nomor WhatsApp</Label>
            <Input
              id="waNumber"
              name="waNumber"
              inputMode="tel"
              defaultValue={member.waNumber ?? ""}
              placeholder="081234567890"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={member.email ?? ""}
              placeholder="nama@email.com"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={member.isActive}
            className="h-5 w-5 accent-primary"
          />
          <label htmlFor="isActive" className="text-sm text-text-secondary">
            Aktif — anggota bisa login. Hilangkan centang untuk menonaktifkan (riwayat & EXP tetap
            aman).
          </label>
        </div>
      </section>

      <AvatarPicker
        defaultValue={getAvatarPreset(member.avatarKey).key}
        previewName={previewName || member.displayName}
      />

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          Data anggota tersimpan.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Link href="/admin/anggota" className="text-sm text-text-muted transition hover:text-text">
          Kembali ke daftar
        </Link>
      </div>
    </form>
  );
}
