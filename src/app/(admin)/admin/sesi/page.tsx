import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { MonthFilter } from "@/components/layout/month-filter";
import { SessionForm } from "@/components/match/session-form";
import { getPlaySessionPeriodKeys, getPlaySessions } from "@/lib/api/matches";
import { requireMenu } from "@/lib/auth/guards";
import { formatDate, formatTime } from "@/lib/utils/format";
import { getPeriod, isValidPeriodKey, periodOptionsFromDates } from "@/lib/utils/period";

export const metadata: Metadata = {
  title: "Sesi Bermain — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = { searchParams: Promise<{ periode?: string }> };

/** Daftar sesi bermain + form buat sesi baru. */
export default async function AdminSessionsPage({ searchParams }: PageProps) {
  await requireMenu("matches");
  const params = await searchParams;
  const selectedPeriod = isValidPeriodKey(params.periode) ? getPeriod(params.periode) : null;

  const [sessions, periodKeys] = await Promise.all([
    getPlaySessions(selectedPeriod?.start, selectedPeriod?.end),
    getPlaySessionPeriodKeys(),
  ]);

  return (
    <Container size="xl">
      <header>
        <p className="text-xs uppercase tracking-[0.04em] text-primary">Admin</p>
        <h1 className="mt-1 font-display text-4xl text-text">Sesi Bermain</h1>
        <p className="mt-2 max-w-2xl text-text-muted">
          Buat sesi dulu (mis. &quot;Sesi Ngabinton 12 Oktober 2026 16.30&quot;), baru game bisa
          dicatat di dalamnya.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">Sesi Baru</h2>
          <div className="mt-4">
            <SessionForm />
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-semibold text-text">Daftar Sesi</h2>
            <MonthFilter
              action="/admin/sesi"
              value={selectedPeriod?.key ?? ""}
              options={periodOptionsFromDates(periodKeys.map((key) => getPeriod(key).start))}
              allOption={{ value: "", label: "Semua bulan" }}
            />
          </div>
          {sessions.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {sessions.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/admin/sesi/${session.id}`}
                    className="block rounded-lg border border-border bg-surface p-4 transition hover:bg-surface-hover"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-text">{session.title}</p>
                      <span className="shrink-0 rounded-pill bg-surface-hover px-3 py-1 text-xs text-text-muted">
                        {session.matchCount} game
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-muted">
                      {formatDate(session.playedAt)} · {formatTime(session.playedAt)}
                      {session.location ? ` · ${session.location}` : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
              {selectedPeriod
                ? `Belum ada sesi di ${selectedPeriod.label}.`
                : "Belum ada sesi. Buat sesi pertama di sebelah kiri."}
            </p>
          )}
        </section>
      </div>
    </Container>
  );
}
