import type { Metadata } from "next";
import Link from "next/link";

import { MatchHistoryList } from "@/components/member/history-list";
import { MemberAvatar } from "@/components/member/member-avatar";
import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";
import { getMemberHistory, getMemberRank, getMemberStats } from "@/lib/api/members";
import { getCurrentUser, isAdminRole, requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Area Anggota — NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

/** Area anggota: profil ringkas, EXP, statistik, dan riwayat main. */
export default async function MemberPage() {
  await requireUser();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="pb-24 pt-28">
        <Container size="lg">
          <p className="text-text-muted">Data anggota tidak ditemukan. Coba masuk ulang.</p>
        </Container>
      </div>
    );
  }

  const [stats, rank, history] = await Promise.all([
    getMemberStats(user.id),
    getMemberRank(user.exp),
    getMemberHistory(user.id),
  ]);

  return (
    <div className="pb-24 pt-28">
      <Container size="lg">
        <header className="flex flex-wrap items-center gap-5">
          <MemberAvatar
            name={user.nickname || user.displayName}
            avatarKey={user.avatarKey}
            avatarUrl={user.avatarUrl}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.04em] text-primary">Area Anggota</p>
            <h1 className="mt-1 truncate text-3xl font-bold text-text">
              {user.nickname || user.displayName}
            </h1>
            <p className="text-sm text-text-muted">
              @{user.username}
              {user.waNumber ? ` · ${user.waNumber}` : " · No. WA belum diisi"}
            </p>
          </div>
          <Link href="/member/profil" className={buttonClass("ghost", "sm")}>
            Edit Profil
          </Link>
        </header>

        {isAdminRole(user.role) ? (
          <p className="mt-6 rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            Kamu masuk sebagai pengurus.{" "}
            <Link href="/admin" className="text-primary underline-offset-4 hover:underline">
              Buka dashboard admin
            </Link>
            .
          </p>
        ) : null}

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="EXP" value={String(user.exp)} accent />
          <StatCard label="Peringkat" value={`#${rank}`} />
          <StatCard label="Game" value={String(stats.games)} />
          <StatCard label="Set Menang" value={`${stats.setsWon}/${stats.setsPlayed}`} />
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text">Riwayat Main</h2>
          <p className="mt-1 text-sm text-text-muted">
            Kapan kamu main dan bagaimana hasilnya di setiap sesi.
          </p>
          <div className="mt-5">
            <MatchHistoryList entries={history} />
          </div>
        </section>
      </Container>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.04em] text-text-muted">{label}</p>
      <p className={accent ? "mt-1 font-display text-3xl text-primary" : "mt-1 font-display text-3xl text-text"}>
        {value}
      </p>
    </div>
  );
}
