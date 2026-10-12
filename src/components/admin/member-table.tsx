import Link from "next/link";

import { MemberAvatar } from "@/components/member/member-avatar";
import type { AdminMemberRow } from "@/lib/api/members";

/** Tabel daftar anggota club untuk admin (COMPONENTS.md §7.18). */
export function MemberTable({ members }: { members: AdminMemberRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-[0.04em] text-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Anggota</th>
            <th className="px-4 py-3 font-medium">Username</th>
            <th className="px-4 py-3 font-medium">Kontak</th>
            <th className="px-4 py-3 text-right font-medium">EXP</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Aksi</th>
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
              <td className="px-4 py-3 text-text-secondary">
                <p>{member.waNumber ?? "—"}</p>
                {member.email ? <p className="text-xs text-text-muted">{member.email}</p> : null}
              </td>
              <td className="px-4 py-3 text-right font-display text-lg tabular-nums text-text">
                {member.exp}
              </td>
              <td className="px-4 py-3">
                <span className={member.isActive ? "text-live" : "text-text-muted"}>
                  {member.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/anggota/${member.id}/edit`}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
