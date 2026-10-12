import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { SessionRow } from "@/components/match/session-row";
import { getPlaySessions } from "@/lib/api/matches";

export const metadata: Metadata = {
  title: "Sesi Mabar — NGABINTON",
  description:
    "Riwayat sesi mabar NGABINTON: jadwal mendatang dan rekap hasil game tiap sesi.",
};

export const revalidate = 0;

/** Daftar sesi mabar: mendatang + sudah lewat. */
export default async function SessionsPage() {
  const sessions = await getPlaySessions();
  const now = new Date();

  const upcoming = sessions
    .filter((session) => session.playedAt >= now)
    .sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
  const past = sessions.filter((session) => session.playedAt < now);

  return (
    <div className="pb-24 pt-28">
      <Container size="lg">
        <header>
          <p className="text-xs uppercase tracking-[0.04em] text-primary">Arsip Mabar</p>
          <h1 className="mt-2 font-display text-4xl text-text md:text-6xl">Sesi Mabar</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Jadwal sesi mendatang dan rekap hasil tiap sesi yang sudah berjalan.
          </p>
        </header>

        {sessions.length === 0 ? (
          <p className="mt-10 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
            Belum ada sesi mabar. Nantikan ya!
          </p>
        ) : null}

        {upcoming.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-text">Akan Datang</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {upcoming.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </ul>
          </section>
        ) : null}

        {past.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-text">Sudah Lewat</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {past.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
