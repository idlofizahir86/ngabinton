import type { Metadata } from "next";
import Link from "next/link";

import { FinanceSummary } from "@/components/finance/finance-summary";
import { Container } from "@/components/layout/container";
import { AchievementList } from "@/components/member/achievement-list";
import { MatchHistoryList } from "@/components/member/history-list";
import { MemberAvatar } from "@/components/member/member-avatar";
import { MemberCard } from "@/components/member/member-card";
import { buttonClass } from "@/components/ui/button";
import { getAchievementsForUser } from "@/lib/api/achievements";
import { getFinanceTotals } from "@/lib/api/finance";
import { getMemberHistory, getMemberPeriodKeys, getMemberStats } from "@/lib/api/members";
import { getStandings, rankFromStandings } from "@/lib/api/rankings";
import { getCurrentUser, getUserMenus, isAdminRole, requireUser } from "@/lib/auth/guards";
import { MonthFilter } from "@/components/layout/month-filter";
import { MENU_DESCRIPTIONS, MENU_HOME, MENU_LABELS } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils/format";
import {
  currentPeriod,
  getPeriod,
  isValidPeriodKey,
  periodOptionsFromDates,
} from "@/lib/utils/period";

export const metadata: Metadata = {
  title: "Area Anggota — NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

type PageProps = {
  searchParams: Promise<{ periode?: string }>;
};

/** Area anggota: profil ringkas, EXP, statistik, dan riwayat main. */
export default async function MemberPage({ searchParams }: PageProps) {
  await requireUser();
  const params = await searchParams;
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

  const period = currentPeriod();
  const selectedPeriod = isValidPeriodKey(params.periode) ? getPeriod(params.periode) : null;

  const [stats, history, achievements, finance, monthFinance, standings, historyPeriodKeys, menus] =
    await Promise.all([
      getMemberStats(user.id),
      getMemberHistory(user.id, {
        from: selectedPeriod?.start,
        to: selectedPeriod?.end,
      }),
      getAchievementsForUser(user.id),
      getFinanceTotals(),
      getFinanceTotals(period.start, period.end),
      getStandings(),
      getMemberPeriodKeys(user.id),
      getUserMenus(user),
    ]);

  const rank = rankFromStandings(standings, user.id);
  const winRate =
    stats.setsPlayed > 0 ? Math.round((stats.setsWon / stats.setsPlayed) * 100) : 0;
  const sessions = standings.find((row) => row.userId === user.id)?.stats.sessions ?? 0;

  return (
    <div className="pb-24 pt-28">
      <Container size="lg">
        <header className="overflow-hidden rounded-xl border border-border bg-background-elevated">
          <div className="h-1 bg-primary" />
          <div className="flex flex-wrap items-center gap-5 p-6">
            <MemberAvatar
              name={user.nickname || user.displayName}
              avatarKey={user.avatarKey}
              avatarUrl={user.avatarUrl}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.04em] text-primary">Area Anggota</p>
              <h1 className="mt-1 truncate font-display text-3xl text-text md:text-4xl">
                {user.nickname || user.displayName}
              </h1>
              <p className="text-sm text-text-muted">
                @{user.username} · Peringkat #{rank}
                {user.waNumber ? ` · ${user.waNumber}` : " · No. WA belum diisi"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/member/profil" className={buttonClass("ghost", "sm")}>
                Edit Profil
              </Link>
              <Link href={`/u/${user.username}`} className={buttonClass("primary", "sm")}>
                Lihat Profil Publik
              </Link>
            </div>
          </div>
        </header>

        {isAdminRole(user.role) ? (
          <p className="mt-6 rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            Kamu masuk sebagai pengurus.{" "}
            <Link href="/admin" className="text-primary underline-offset-4 hover:underline">
              Buka dashboard admin
            </Link>
            .
          </p>
        ) : menus.length > 0 ? (
          <section className="mt-6 rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-text">Tugas Saya</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Menu yang dipercayakan admin kepadamu. Buka salah satu untuk langsung mencatat.
                </p>
              </div>
              <Link href="/admin" className={buttonClass("ghost", "sm")}>
                Buka Panel Staf
              </Link>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {menus.map((menu) => (
                <li key={menu}>
                  <Link
                    href={MENU_HOME[menu]}
                    className="flex h-full flex-col gap-1 rounded-lg border border-border bg-background-elevated p-4 transition hover:border-border-strong hover:bg-surface-hover"
                  >
                    <span className="text-sm font-semibold text-text">{MENU_LABELS[menu]}</span>
                    <span className="text-xs text-text-muted">{MENU_DESCRIPTIONS[menu]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="EXP" value={String(user.exp)} accent />
          <StatCard label="Peringkat" value={`#${rank}`} />
          <StatCard label="Sesi" value={String(sessions)} />
          <StatCard label="Game" value={String(stats.games)} />
          <StatCard label="Win Rate" value={stats.setsPlayed > 0 ? `${winRate}%` : "—"} />
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-border bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-text">Kas Ngabinton</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Transparan untuk semua anggota. Saldo keseluruhan & bulan ini.
                </p>
              </div>
              <Link href="/member/keuangan" className={buttonClass("ghost", "sm")}>
                Buku Kas
              </Link>
            </div>
            <FinanceSummary totals={finance} caption="Saldo keseluruhan" className="mt-4" />
            <p className="mt-3 text-sm text-text-muted">
              {period.label}: pemasukan {formatRupiah(monthFinance.income)} · pengeluaran{" "}
              {formatRupiah(monthFinance.expense)}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text">Ngabinton Member Card</h2>
            <p className="mt-1 text-sm text-text-muted">
              Kartu dengan EXP, peringkat, dan badge kamu. Bisa diunduh sebagai PNG.
            </p>
            <div className="mt-4">
              <MemberCard
                member={{
                  displayName: user.displayName,
                  nickname: user.nickname,
                  username: user.username,
                  avatarKey: user.avatarKey,
                  avatarUrl: user.avatarUrl,
                  exp: user.exp,
                  rank,
                  sessions,
                  games: stats.games,
                  achievements,
                }}
              />
            </div>
            <a
              href={`/api/member-card/${user.username}`}
              className={buttonClass("primary", "sm", "mt-3")}
            >
              Unduh Member Card
            </a>
          </section>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text">Pencapaian</h2>
          <p className="mt-1 text-sm text-text-muted">
            ACE bulanan, Pang-Tangguh, milestone EXP/sesi, dan kemenangan pertama.
          </p>
          <div className="mt-4">
            <AchievementList achievements={achievements} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text">Riwayat Main</h2>
          <p className="mt-1 text-sm text-text-muted">
            Kapan kamu main dan bagaimana hasilnya di setiap sesi.
          </p>
          <p className="mt-1">
            <Link href="/sesi" className="text-sm text-text-muted transition hover:text-text">
              Lihat rekap per sesi →
            </Link>
          </p>
          <div className="mt-4">
            <MonthFilter
              action="/member"
              value={selectedPeriod?.key ?? ""}
              options={periodOptionsFromDates(
                historyPeriodKeys.map((key) => getPeriod(key).start),
              )}
              allOption={{ value: "", label: "Semua bulan" }}
            />
          </div>
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
