import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FinanceLedger } from "@/components/finance/finance-ledger";
import { FinanceSummary } from "@/components/finance/finance-summary";
import { SessionDuesPanel } from "@/components/finance/session-dues-panel";
import { Container } from "@/components/layout/container";
import { DeleteSessionButton } from "@/components/match/delete-session-button";
import { MatchCard } from "@/components/match/match-card";
import { MatchRecorder } from "@/components/match/match-recorder";
import { SessionAttendancePanel } from "@/components/match/session-attendance-panel";
import { buttonClass } from "@/components/ui/button";
import { getFinanceEntries, getSessionFinanceTotals } from "@/lib/api/finance";
import { getMemberOptions, getPlaySessionById } from "@/lib/api/matches";
import { getSessionDuesStatus } from "@/lib/api/session-dues";
import { getCurrentUser, getUserMenus, requireMenu } from "@/lib/auth/guards";
import { formatDate, formatTime } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Detail Sesi — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = { params: Promise<{ id: string }> };

/** Detail satu sesi: catat game + daftar game. */
export default async function AdminSessionDetailPage({ params }: PageProps) {
  await requireMenu("matches");
  const { id } = await params;
  const [session, members, financeTotals, financeEntries, duesRows, user] = await Promise.all([
    getPlaySessionById(id),
    getMemberOptions(),
    getSessionFinanceTotals(id),
    getFinanceEntries({ sessionId: id }),
    getSessionDuesStatus(id),
    getCurrentUser(),
  ]);

  if (!session) {
    notFound();
  }

  const menus = user ? await getUserMenus(user) : [];
  const canManageFinance = menus.includes("finance");
  const paidCount = duesRows.filter((row) => row.paidAmount > 0).length;
  const unpaidCount = duesRows.length - paidCount;

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
          {session.createdByUser ? (
            <p className="mt-1 text-xs text-text-subtle">
              Dibuat{" "}
              {session.createdByUser.nickname?.trim() || session.createdByUser.displayName}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-3">
          <Link href={`/admin/sesi/${session.id}/edit`} className={buttonClass("ghost", "sm")}>
            Edit Sesi
          </Link>
          <DeleteSessionButton sessionId={session.id} gameCount={session.matches.length} />
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">Catat Game Baru</h2>
          <p className="mt-1 text-sm text-text-muted">
            Isi pemain tiap tim (boleh 1–N orang, termasuk BaturanNgabinton) dan skor setiap set.
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

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text">Kehadiran ({duesRows.length})</h2>
            <p className="mt-1 text-sm text-text-muted">
              Peserta game otomatis tercatat hadir. Tambahkan anggota yang datang tapi tidak ikut
              main supaya iurannya ikut terpantau.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <SessionAttendancePanel
            sessionId={session.id}
            attendees={duesRows}
            members={members}
          />
        </div>
      </section>

      {canManageFinance ? (
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text">Iuran Sesi</h2>
              <p className="mt-1 text-sm text-text-muted">
                Hadir {duesRows.length} · sudah bayar {paidCount} · belum bayar {unpaidCount}.
              </p>
            </div>
          </div>
          {duesRows.length > 0 ? (
            <div className="mt-4 rounded-lg border border-border bg-surface p-4">
              <SessionDuesPanel
                sessionId={session.id}
                sessionTitle={session.title}
                rows={duesRows}
              />
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
              Belum ada anggota hadir yang bisa dicatat iurannya di sesi ini.
            </p>
          )}
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text">Keuangan Sesi</h2>
            <p className="mt-1 text-sm text-text-muted">
              Iuran dan biaya yang ditautkan ke sesi ini.
            </p>
          </div>
          <Link href="/admin/keuangan" className={buttonClass("ghost", "sm")}>
            Buka Keuangan
          </Link>
        </div>
        <FinanceSummary totals={financeTotals} caption="Kas sesi ini" className="mt-4" />
        <div className="mt-4">
          <FinanceLedger
            entries={financeEntries}
            emptyText="Belum ada transaksi keuangan untuk sesi ini."
          />
        </div>
      </section>
    </Container>
  );
}
