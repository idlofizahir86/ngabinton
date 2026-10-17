import type { Metadata } from "next";
import Link from "next/link";

import { ConvertAllGuestsForm } from "@/components/admin/convert-all-guests-form";
import { MemberTable } from "@/components/admin/member-table";
import { Container } from "@/components/layout/container";
import { GuestConvertForm } from "@/components/match/guest-convert-form";
import { buttonClass } from "@/components/ui/button";
import { getGuests } from "@/lib/api/matches";
import { getAllMembers } from "@/lib/api/members";
import { requireMenu } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Anggota — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

/** Kelola anggota club + konversi BaturanNgabinton menjadi anggota. */
export default async function AdminMembersPage() {
  await requireMenu("members");
  const [members, guests] = await Promise.all([getAllMembers(), getGuests()]);

  return (
    <Container size="xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.04em] text-primary">Admin</p>
          <h1 className="mt-1 font-display text-4xl text-text">Anggota Club</h1>
          <p className="mt-2 max-w-2xl text-text-muted">
            Tambah atau perbarui data anggota, atur status aktif, dan konversi BaturanNgabinton agar
            EXP-nya masuk Pang-Giatna Ngabinton.
          </p>
        </div>
        <Link href="/admin/anggota/tambah" className={buttonClass("primary", "sm")}>
          Tambah Anggota
        </Link>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-text">Anggota ({members.length})</h2>
        <div className="mt-4">
          <MemberTable members={members} />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text">BaturanNgabinton ({guests.length})</h2>
            <p className="mt-1 max-w-2xl text-sm text-text-muted">
              Nama yang dipakai saat main tapi belum terdaftar sebagai anggota. Konversi massal
              membuat akun otomatis (username dari namanya) dan menarik seluruh riwayat game serta
              EXP-nya.
            </p>
          </div>
          <ConvertAllGuestsForm guestCount={guests.length} />
        </div>

        {guests.length > 0 ? (
          <div className="mt-6 flex flex-col gap-4">
            {guests.map((guest) => (
              <div key={guest.guestName}>
                <p className="mb-2 text-sm text-text-secondary">
                  <span className="font-semibold text-text">{guest.guestName}</span> · {guest.games}{" "}
                  game
                </p>
                <GuestConvertForm guestName={guest.guestName} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
            Belum ada BaturanNgabinton tercatat. Kalau ada nama baturan di pertandingan, akan muncul
            di sini.
          </p>
        )}
      </section>
    </Container>
  );
}
