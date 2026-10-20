import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { AttendanceList } from "@/components/match/attendance-list";
import { MatchResultCard } from "@/components/match/match-result-card";
import { RsvpGroup } from "@/components/match/session-rsvp-card";
import { SessionExpSummary } from "@/components/match/session-exp-summary";
import { getPlaySessionById, getSessionAttendance } from "@/lib/api/matches";
import { getCurrentUser } from "@/lib/auth/guards";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Rekap Sesi — NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

/** Rekap satu sesi mabar: RSVP, EXP per pemain, dan hasil tiap game. */
export default async function SessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [session, user] = await Promise.all([getPlaySessionById(id), getCurrentUser()]);

  if (!session) {
    notFound();
  }

  const attendance = await getSessionAttendance(session.id);

  const reveal = Boolean(user);
  const isUpcoming = session.playedAt >= new Date();
  const hadir = session.rsvps.filter((rsvp) => rsvp.choice === "hadir");
  const skip = session.rsvps.filter((rsvp) => rsvp.choice === "skip");

  const schedule = session.endedAt
    ? `${formatDate(session.playedAt)} · ${formatTime(session.playedAt)}–${formatTime(session.endedAt)}`
    : formatDateTime(session.playedAt);

  return (
    <div className="pb-24 pt-28">
      <Container size="lg">
        <Link href="/sesi" className="text-sm text-text-muted transition hover:text-text">
          ← Semua sesi
        </Link>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-text md:text-4xl">{session.title}</h1>
            <span className="rounded-pill bg-surface-hover px-3 py-1 text-xs uppercase tracking-[0.04em] text-text-muted">
              {isUpcoming ? "Akan Datang" : "Selesai"}
            </span>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            {schedule}
            {session.location ? ` · ${session.location}` : ""}
          </p>
          {session.notes ? <p className="mt-2 text-text-secondary">{session.notes}</p> : null}
        </header>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-text">Rencana Hadir</h2>
          {!reveal ? (
            <p className="mt-1 text-sm text-text-muted">
              Nama pemilih disensor untuk pengunjung.{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Masuk
              </Link>{" "}
              untuk melihat nama lengkap.
            </p>
          ) : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <RsvpGroup choice="hadir" members={hadir} reveal={reveal} currentUserId={null} />
            <RsvpGroup choice="skip" members={skip} reveal={reveal} currentUserId={null} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text">
            Kehadiran ({attendance.length})
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Anggota yang benar-benar hadir di sesi ini — peserta game dan yang ditandai pengurus.
          </p>
          <div className="mt-4">
            <AttendanceList attendees={attendance} reveal={reveal} currentUserId={user?.id ?? null} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text">EXP Sesi Ini</h2>
          <p className="mt-1 text-sm text-text-muted">
            Total EXP yang didapat tiap pemain dari game di sesi ini.
          </p>
          <div className="mt-4">
            <SessionExpSummary session={session} reveal={reveal} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text">Hasil Game ({session.matches.length})</h2>
          {session.matches.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {session.matches.map((match) => (
                <MatchResultCard key={match.id} match={match} reveal={reveal} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
              Belum ada game tercatat di sesi ini.
            </p>
          )}
        </section>
      </Container>
    </div>
  );
}
