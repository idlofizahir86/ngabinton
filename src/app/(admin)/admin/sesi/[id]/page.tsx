import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteSessionAction } from "@/actions/match";
import { Container } from "@/components/layout/container";
import { MatchCard } from "@/components/match/match-card";
import { MatchRecorder } from "@/components/match/match-recorder";
import { getMemberOptions, getPlaySessionById } from "@/lib/api/matches";
import { formatDate, formatTime } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Detail Sesi — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

/** Detail satu sesi: catat game + daftar game. */
export default async function AdminSessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [session, members] = await Promise.all([getPlaySessionById(id), getMemberOptions()]);

  if (!session) {
    notFound();
  }

  return (
    <Container size="xl">
      <Link href="/admin/sesi" className="text-sm text-text-muted transition hover:text-text">
        ← Semua sesi
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.04em] text-primary">Sesi Bermain</p>
          <h1 className="mt-1 text-3xl font-bold text-text">{session.title}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {formatDate(session.playedAt)} · {formatTime(session.playedAt)}
            {session.endedAt ? ` – ${formatTime(session.endedAt)}` : ""}
            {session.location ? ` · ${session.location}` : ""}
          </p>
          {session.notes ? <p className="mt-2 text-sm text-text-secondary">{session.notes}</p> : null}
        </div>
        <form action={deleteSessionAction}>
          <input type="hidden" name="sessionId" value={session.id} />
          <button
            type="submit"
            className="rounded-md border border-danger px-3 py-2 text-sm text-danger transition hover:bg-danger/10"
          >
            Hapus Sesi
          </button>
        </form>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">Catat Game Baru</h2>
          <p className="mt-1 text-sm text-text-muted">
            Isi pemain tiap tim (boleh 1–N orang, termasuk tamu) dan skor setiap set.
          </p>
          <div className="mt-5">
            <MatchRecorder sessionId={session.id} members={members} />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text">
            Game ({session.matches.length})
          </h2>
          {session.matches.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {session.matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
              Belum ada game di sesi ini.
            </p>
          )}
        </section>
      </div>
    </Container>
  );
}
