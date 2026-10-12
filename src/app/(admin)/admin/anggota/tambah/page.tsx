import type { Metadata } from "next";
import Link from "next/link";

import { MemberCreateForm } from "@/components/admin/member-create-form";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Tambah Anggota — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

/** Halaman admin: tambah anggota club baru. */
export default function AdminMemberCreatePage() {
  return (
    <Container size="lg">
      <Link href="/admin/anggota" className="text-sm text-text-muted transition hover:text-text">
        ← Kembali ke daftar anggota
      </Link>

      <header className="mt-4">
        <p className="text-xs uppercase tracking-[0.04em] text-primary">Admin</p>
        <h1 className="mt-1 font-display text-4xl text-text">Tambah Anggota</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Buat akun anggota baru. Password awal mengikuti pola{" "}
          <span className="font-mono">username + ngabinton</span> seperti seed anggota yang ada.
        </p>
      </header>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6 sm:p-8">
        <MemberCreateForm />
      </div>
    </Container>
  );
}
