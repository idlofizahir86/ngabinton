import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";
import { getPlaySessions } from "@/lib/api/matches";
import { getLeaderboard } from "@/lib/api/members";

export const metadata: Metadata = {
  title: "Dashboard Admin — NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

function totalMatches(sessions: { matchCount: number }[]): number {
  return sessions.reduce((sum, session) => sum + session.matchCount, 0);
}

/** Dashboard admin — ringkasan & pintasan fitur. */
export default async function AdminDashboardPage() {
  const [sessions, members] = await Promise.all([getPlaySessions(), getLeaderboard()]);
  const matchCount = totalMatches(sessions);

  return (
    <Container size="xl">
      <header>
        <p className="text-xs uppercase tracking-[0.04em] text-primary">Admin</p>
        <h1 className="mt-1 font-display text-4xl text-text">Dashboard</h1>
        <p className="mt-2 text-text-muted">
          Kelola sesi bermain, catat pertandingan, dan atur anggota club.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Anggota" value={members.length} />
        <Stat label="Sesi Bermain" value={sessions.length} />
        <Stat label="Game Tercatat" value={matchCount} />
        <Stat label="Peserta Aktif" value={members.filter((m) => m.stats.games > 0).length} />
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">Sesi Bermain</h2>
          <p className="mt-2 text-sm text-text-muted">
            Buat sesi (contoh: &quot;Sesi Ngabinton 12 Oktober 2026&quot;), lalu catat tiap game di
            dalamnya. Game hanya bisa dicatat setelah sesi dibuat.
          </p>
          <Link href="/admin/sesi" className={buttonClass("primary", "sm", "mt-4")}>
            Kelola Sesi
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">Anggota Club</h2>
          <p className="mt-2 text-sm text-text-muted">
            Lihat daftar anggota, dan ubah BaturanNgabinton menjadi anggota agar EXP-nya masuk
            Pang-Giatna Ngabinton.
          </p>
          <Link href="/admin/anggota" className={buttonClass("ghost", "sm", "mt-4")}>
            Kelola Anggota
          </Link>
        </div>
      </section>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.04em] text-text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl text-text">{value}</p>
    </div>
  );
}
