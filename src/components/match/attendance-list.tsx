import { MemberAvatar } from "@/components/member/member-avatar";
import type { SessionAttendee } from "@/lib/api/matches";
import { maskName } from "@/lib/members/name";
import { cn } from "@/lib/utils/cn";

export type AttendanceListProps = {
  attendees: SessionAttendee[];
  /** `true` untuk pengguna yang login (nama lengkap). */
  reveal: boolean;
  currentUserId?: number | null;
};

/** Daftar kehadiran nyata satu sesi (peserta game + ditandai pengurus). */
export function AttendanceList({ attendees, reveal, currentUserId = null }: AttendanceListProps) {
  if (attendees.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
        Belum ada kehadiran tercatat untuk sesi ini.
      </p>
    );
  }

  return (
    <ul className="grid gap-2 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2">
      {attendees.map((attendee) => (
        <li key={attendee.key} className="flex items-center gap-2">
          <MemberAvatar
            name={attendee.name}
            avatarKey={attendee.avatarKey}
            avatarUrl={attendee.avatarUrl}
            size="sm"
          />
          <span
            className={cn(
              "truncate text-sm",
              attendee.userId !== null && attendee.userId === currentUserId
                ? "font-semibold text-text"
                : "text-text-secondary",
            )}
          >
            {reveal ? attendee.name : maskName(attendee.name)}
          </span>
          {attendee.isGuest ? (
            <span className="shrink-0 rounded-pill bg-surface-hover px-2 py-0.5 text-[10px] uppercase tracking-[0.04em] text-text-muted">
              Baturan
            </span>
          ) : null}
          {attendee.played ? (
            <span className="ml-auto shrink-0 rounded-pill bg-surface-hover px-2 py-0.5 text-[10px] uppercase tracking-[0.04em] text-text-muted">
              Main
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
