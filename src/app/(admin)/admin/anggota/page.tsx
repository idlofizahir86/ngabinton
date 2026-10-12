import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { GuestConvertForm } from "@/components/match/guest-convert-form";
import { MemberAvatar } from "@/components/member/member-avatar";
import { getGuests } from "@/lib/api/matches";
import { getAllMembers } from "@/lib/api/members";

export const metadata: Metadata = {
  title: "Anggota — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

/** Kelola anggota club + konversi tamu menjadi anggota. */
export default async function AdminMembersPage() {
  const [members, guests] = await Promise.all([getAllMembers(), getGuests()]);

  return (
    <Container size="xl">
      <header>
        <p className="text-xs uppercase tracking-[0.04em] text-primary">Admin</p>
        <h1 className="mt-1 font-display text-4xl text-text">Anggota Club</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Daftar anggota terdaftar. Nama tamu yang belum jadi anggota bisa dikonversi agar EXP-nya
          masuk Pang-Giatna Ngabinton.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-text">Anggota ({members.length})</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-[0.04em] text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Anggota</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">No. WA</th>
                <th className="px-4 py-3 text-right font-medium">EXP</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <MemberAvatar
                        name={member.nickname || member.displayName}
                        avatarKey={member.avatarKey}
                        avatarUrl={member.avatarUrl}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold text-text">{member.displayName}</p>
                        {member.nickname ? (
                          <p className="text-xs text-text-muted">{member.nickname}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">@{member.username}</td>
                  <td className="px-4 py-3 text-text-secondary">{member.waNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-display text-lg tabular-nums text-text">
                    {member.exp}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        member.isActive ? "text-live" : "text-text-muted"
                      }
                    >
                      {member.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-text">Tamu / Baturan ({guests.length})</h2>
        <p className="mt-1 text-sm text-text-muted">
          Nama yang dipakai saat main tapi belum terdaftar sebagai anggota.
        </p>
        {guests.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {guests.map((guest) => (
              <div key={guest.guestName}>
                <p className="mb-2 text-sm text-text-secondary">
                  <span className="font-semibold text-text">{guest.guestName}</span> · {guest.games} game
                </p>
                <GuestConvertForm guestName={guest.guestName} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
            Tidak ada tamu tercatat.
          </p>
        )}
      </section>
    </Container>
  );
}
