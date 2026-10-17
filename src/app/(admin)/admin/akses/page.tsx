import type { Metadata } from "next";
import Link from "next/link";

import { AccessForm } from "@/components/admin/access-form";
import { Container } from "@/components/layout/container";
import { getAssignableUsers, getMenuAccessMap } from "@/lib/api/access";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Akses Menu — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

/** Admin utama: assign menu area pengurus ke anggota tertentu (RULES.md §5.5). */
export default async function AdminAccessPage() {
  await requireAdmin();
  const [members, accessMap] = await Promise.all([getAssignableUsers(), getMenuAccessMap()]);

  return (
    <Container size="xl">
      <header>
        <p className="text-xs uppercase tracking-[0.04em] text-primary">Admin</p>
        <h1 className="mt-1 font-display text-4xl text-text">Akses Menu</h1>
        <p className="mt-2 max-w-3xl text-text-muted">
          Beri anggota kepercayaan untuk membantu operasional: mencatat pertandingan, mencatat
          keuangan, mengelola anggota, atau mengelola event. Pengurus (admin &amp; superadmin)
          otomatis punya akses ke semua menu. Anggota tanpa akses tetap memakai area{" "}
          <Link href="/member" className="text-primary underline-offset-4 hover:underline">
            /member
          </Link>
          .
        </p>
      </header>

      {members.length === 0 ? (
        <p className="mt-8 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
          Belum ada anggota aktif. Tambah anggota dulu di menu Anggota.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {members.map((member) => (
            <li key={member.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-text">{member.nickname || member.displayName}</p>
                  <p className="text-sm text-text-muted">@{member.username}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.04em] text-text-muted">
                  {(accessMap.get(member.id) ?? []).length} menu aktif
                </p>
              </div>
              <div className="mt-4">
                <AccessForm userId={member.id} initialMenus={accessMap.get(member.id) ?? []} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
