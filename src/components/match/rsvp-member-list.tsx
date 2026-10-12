"use client";

import { useState } from "react";

import { MemberAvatar } from "@/components/member/member-avatar";
import type { SessionRsvpWithUser } from "@/lib/api/matches";
import { memberLabel } from "@/lib/members/name";
import { cn } from "@/lib/utils/cn";

/** Jumlah nama yang tampil sebelum tombol "+N lainnya" diklik. */
const VISIBLE_COUNT = 3;

/** Daftar pemilih RSVP: ringkas 3 nama, sisanya disembunyikan sampai diklik. */
export function RsvpMemberList({
  members,
  reveal,
  currentUserId,
}: {
  members: SessionRsvpWithUser[];
  reveal: boolean;
  currentUserId: number | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const hiddenCount = members.length - VISIBLE_COUNT;
  const visible = expanded ? members : members.slice(0, VISIBLE_COUNT);

  return (
    <>
      <ul className="flex flex-wrap gap-x-3 gap-y-2">
        {visible.map((rsvp) => (
          <li key={rsvp.id} className="flex items-center gap-2">
            <MemberAvatar
              name={rsvp.user.nickname || rsvp.user.displayName}
              avatarKey={rsvp.user.avatarKey}
              avatarUrl={rsvp.user.avatarUrl}
              size="sm"
            />
            <span
              className={cn(
                "text-sm",
                rsvp.userId === currentUserId ? "font-semibold text-text" : "text-text-secondary",
              )}
            >
              {memberLabel(rsvp.user, reveal)}
            </span>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="self-start text-xs text-text-muted transition duration-150 ease-brand hover:text-text"
        >
          {expanded ? "Sembunyikan" : `+${hiddenCount} lainnya`}
        </button>
      ) : null}
    </>
  );
}
