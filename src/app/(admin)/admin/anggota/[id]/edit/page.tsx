import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MemberEditForm } from "@/components/admin/member-edit-form";
import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { Container } from "@/components/layout/container";
import { getMemberById } from "@/lib/api/members";
import { requireMenu } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Edit Anggota — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

/** Halaman admin: edit data anggota club. */
export default async function AdminMemberEditPage({ params }: PageProps) {
  await requireMenu("members");
  const { id } = await params;
  const memberId = Number(id);
  const member = Number.isInteger(memberId) ? await getMemberById(memberId) : null;

  if (!member) {
    notFound();
  }

  return (
    <Container size="lg">
      <Link href="/admin/anggota" className="text-sm text-text-muted transition hover:text-text">
        ← Kembali ke daftar anggota
      </Link>

      <header className="mt-4">
        <p className="text-xs uppercase tracking-[0.04em] text-primary">Admin</p>
        <h1 className="mt-1 font-display text-4xl text-text">{member.displayName}</h1>
        <p className="mt-2 text-text-muted">
          Perbarui identitas, kontak, avatar, atau status keaktifan anggota. Riwayat game dan EXP
          tidak terpengaruh.
        </p>
      </header>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6 sm:p-8">
        <MemberEditForm
          member={{
            id: member.id,
            username: member.username,
            displayName: member.displayName,
            nickname: member.nickname,
            waNumber: member.waNumber,
            email: member.email,
            avatarKey: member.avatarKey,
            isActive: member.isActive,
          }}
        />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-text">Keamanan</h2>
        <p className="mt-1 text-sm text-text-muted">
          Lupa password? Kembalikan ke default supaya anggota bisa masuk dan menggantinya sendiri di
          halaman Profil.
        </p>
        <div className="mt-4">
          <ResetPasswordForm memberId={member.id} username={member.username} />
        </div>
      </section>
    </Container>
  );
}
