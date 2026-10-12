import Link from "next/link";

import { RsvpButtons } from "@/components/match/rsvp-buttons";
import { MemberAvatar } from "@/components/member/member-avatar";
import type { SessionRsvpWithUser, UpcomingSession } from "@/lib/api/matches";
import { RSVP_LABELS, type RsvpChoice } from "@/lib/constants";
import { memberLabel } from "@/lib/members/name";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";

export function RsvpGroup({
  choice,
  members,
  reveal,
  currentUserId,
}: {
  choice: RsvpChoice;
  members: SessionRsvpWithUser[];
  reveal: boolean;
  currentUserId: number | null;
}) {
  const isHadir = choice === "hadir";

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-background/40 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className={cn(isHadir ? "text-live" : "text-text-muted")}>{RSVP_LABELS[choice]}</span>
        <span className="text-text-subtle">· {members.length}</span>
      </p>

      {members.length > 0 ? (
        <ul className="flex flex-wrap gap-x-3 gap-y-2">
          {members.map((rsvp) => (
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
      ) : (
        <p className="text-xs text-text-subtle">Belum ada.</p>
      )}
    </div>
  );
}

export type SessionRsvpCardProps = {
  session: UpcomingSession;
  /** `true` untuk pengguna yang login (nama lengkap). */
  reveal: boolean;
  isLoggedIn: boolean;
  currentUserId: number | null;
};

/** Kartu jadwal sesi mendatang + polling kehadiran (COMPONENTS.md §7.10). */
export function SessionRsvpCard({
  session,
  reveal,
  isLoggedIn,
  currentUserId,
}: SessionRsvpCardProps) {
  const hadir = session.rsvps.filter((rsvp) => rsvp.choice === "hadir");
  const skip = session.rsvps.filter((rsvp) => rsvp.choice === "skip");
  const currentChoice =
    session.rsvps.find((rsvp) => rsvp.userId === currentUserId)?.choice ?? null;

  return (
    <article className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-text">{session.title}</h3>
          <p className="mt-1 text-sm text-text-muted">{formatDateTime(session.playedAt)}</p>
          {session.location ? (
            <p className="mt-0.5 text-sm text-text-muted">{session.location}</p>
          ) : null}
        </div>
        <span className="rounded-pill bg-surface-hover px-3 py-1 text-xs uppercase tracking-[0.04em] text-text-muted">
          Sesi Mendatang
        </span>
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <RsvpGroup
          choice="hadir"
          members={hadir}
          reveal={reveal}
          currentUserId={currentUserId}
        />
        <RsvpGroup choice="skip" members={skip} reveal={reveal} currentUserId={currentUserId} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          {isLoggedIn ? (
            <RsvpButtons sessionId={session.id} currentChoice={currentChoice} />
          ) : (
            <p className="text-sm text-text-muted">
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Masuk
              </Link>{" "}
              untuk mencatat rencana hadirmu.
            </p>
          )}
        </div>
        <Link
          href={`/sesi/${session.id}`}
          className="text-sm text-text-muted transition hover:text-text"
        >
          Detail sesi →
        </Link>
      </div>
    </article>
  );
}
