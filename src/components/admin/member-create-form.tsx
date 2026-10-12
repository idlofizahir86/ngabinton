"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { createMemberAction } from "@/actions/admin-members";
import { AvatarPicker } from "@/components/member/avatar-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEMBER_PASSWORD_SUFFIX } from "@/lib/constants";
import { INITIAL_MEMBER_FORM_STATE } from "@/lib/forms/states";
import { DEFAULT_AVATAR_KEY } from "@/lib/members/avatars";

/** Form admin: tambah anggota club baru (password awal `{username}ngabinton`). */
export function MemberCreateForm() {
  const [state, formAction, isPending] = useActionState(createMemberAction, INITIAL_MEMBER_FORM_STATE);
  const [previewName, setPreviewName] = useState("");

  if (state.ok) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <p role="status" className="text-sm text-live">
          Anggota baru tersimpan. Password awal:{" "}
          <span className="font-mono">username + {MEMBER_PASSWORD_SUFFIX}</span>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/anggota" className="text-sm text-primary underline-offset-4 hover:underline">
            ← Kembali ke daftar anggota
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="username"
            pattern="[a-z0-9_]+"
            autoComplete="off"
            autoCapitalize="none"
            required
          />
          <p className="text-xs text-text-muted">
            Huruf kecil, angka, underscore, minimal 3 karakter. Dipakai untuk login.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="displayName">Nama</Label>
          <Input
            id="displayName"
            name="displayName"
            required
            onChange={(event) => setPreviewName(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nickname">Nama Punggung</Label>
          <Input id="nickname" name="nickname" placeholder="Tampil di Pang-Giatna Ngabinton" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="waNumber">Nomor WhatsApp</Label>
            <Input id="waNumber" name="waNumber" inputMode="tel" placeholder="081234567890" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@email.com" />
          </div>
        </div>
      </section>

      <AvatarPicker defaultValue={DEFAULT_AVATAR_KEY} previewName={previewName || "Anggota"} />

      <p className="text-xs text-text-muted">
        Password awal: <span className="font-mono">username + {MEMBER_PASSWORD_SUFFIX}</span>.
        Anggota bisa menggantinya sendiri nanti.
      </p>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Anggota"}
        </Button>
        <Link href="/admin/anggota" className="text-sm text-text-muted transition hover:text-text">
          Batal
        </Link>
      </div>
    </form>
  );
}
