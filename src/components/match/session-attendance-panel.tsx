import {
  addSessionAttendanceAction,
  removeSessionAttendanceAction,
} from "@/actions/session-attendance";
import { MemberAvatar } from "@/components/member/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MemberOption, SessionAttendee } from "@/lib/api/matches";

export type SessionAttendancePanelProps = {
  sessionId: string;
  attendees: SessionAttendee[];
  members: MemberOption[];
};

const SELECT_CLASSES =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:shadow-focus";

/**
 * Kelola kehadiran nyata satu sesi (admin). Peserta game — anggota maupun
 * BaturanNgabinton — otomatis hadir; di sini pengurus bisa menambah yang
 * datang tapi tidak ikut main.
 */
export function SessionAttendancePanel({
  sessionId,
  attendees,
  members,
}: SessionAttendancePanelProps) {
  const presentMemberIds = new Set(
    attendees.filter((attendee) => attendee.userId !== null).map((attendee) => attendee.userId),
  );
  const candidates = members.filter((member) => !presentMemberIds.has(member.id));

  return (
    <div className="flex flex-col gap-4">
      {attendees.length === 0 ? (
        <p className="rounded-lg border border-border bg-background-elevated p-4 text-sm text-text-muted">
          Belum ada yang tercatat hadir. Peserta game otomatis hadir; tambahkan yang datang tanpa
          ikut main di bawah.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-background-elevated">
          {attendees.map((attendee) => (
            <li key={attendee.key} className="flex items-center gap-3 px-3 py-2.5">
              <MemberAvatar
                name={attendee.name}
                avatarKey={attendee.avatarKey}
                avatarUrl={attendee.avatarUrl}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text">{attendee.name}</p>
                <p className="text-[10px] uppercase tracking-[0.04em] text-text-subtle">
                  {attendee.isGuest ? "BaturanNgabinton" : "Anggota"} ·{" "}
                  {attendee.played ? "Peserta game" : "Ditandai hadir"}
                </p>
              </div>
              {attendee.attendanceId && !attendee.played ? (
                <form action={removeSessionAttendanceAction}>
                  <input type="hidden" name="sessionId" value={sessionId} />
                  <input type="hidden" name="attendanceId" value={attendee.attendanceId} />
                  <button
                    type="submit"
                    className="text-xs text-text-muted transition hover:text-danger"
                  >
                    Hapus
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 rounded-lg border border-border bg-background-elevated p-3 lg:grid-cols-2">
        {candidates.length > 0 ? (
          <form action={addSessionAttendanceAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="sessionId" value={sessionId} />
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Label htmlFor="attendanceMember">Tambah Anggota Hadir</Label>
              <select
                id="attendanceMember"
                name="userId"
                required
                defaultValue={candidates[0]?.id ?? ""}
                className={SELECT_CLASSES}
              >
                {candidates.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.nickname || member.displayName}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" variant="ghost" size="sm">
              Tandai Hadir
            </Button>
          </form>
        ) : (
          <p className="self-center text-xs text-text-muted">
            Semua anggota aktif sudah tercatat hadir di sesi ini.
          </p>
        )}

        <form action={addSessionAttendanceAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="sessionId" value={sessionId} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Label htmlFor="attendanceGuest">Tambah BaturanNgabinton</Label>
            <Input
              id="attendanceGuest"
              name="guestName"
              maxLength={40}
              placeholder="Nama tamu"
              required
            />
          </div>
          <Button type="submit" variant="ghost" size="sm">
            Tandai Tamu
          </Button>
        </form>
      </div>
    </div>
  );
}
