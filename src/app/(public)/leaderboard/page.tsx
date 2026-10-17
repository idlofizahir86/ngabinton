import type { Metadata } from "next";
import Link from "next/link";

import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { MonthlyAwards, type AwardEntry } from "@/components/leaderboard/monthly-awards";
import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";
import {
  ensureMonthlyAwards,
  getAchievementsForPeriod,
  getAchievementsMap,
} from "@/lib/api/achievements";
import { PeriodToggle } from "@/components/leaderboard/period-toggle";
import {
  countMatchesInPeriod,
  getMonthlyStandings,
  getPlayedPeriodKeys,
  getStandings,
} from "@/lib/api/rankings";
import { getCurrentUser } from "@/lib/auth/guards";
import { EXP_LOSS_PER_SET, EXP_WIN_PER_SET } from "@/lib/constants";
import {
  currentPeriod,
  getPeriod,
  isValidPeriodKey,
  previousPeriod,
  type PeriodOption,
} from "@/lib/utils/period";

export const metadata: Metadata = {
  title: "Pang-Giatna Ngabinton — NGABINTON",
  description:
    "Papan peringkat EXP anggota club NGABINTON: ACE & Pang-Tangguh Of The Month, serta All Of Time.",
};

export const revalidate = 0;

type PageProps = {
  searchParams: Promise<{ periode?: string }>;
};

/** Halaman Pang-Giatna — publik, nama disensor untuk pengunjung (RULES.md §13.3/§13.5). */
export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const allMode = params.periode === "all";
  const selectedPeriod = isValidPeriodKey(params.periode) ? getPeriod(params.periode) : null;
  const current = currentPeriod();
  const period = selectedPeriod ?? current;

  // Idempotent & murah: finalisasi ACE/Pang-Tangguh bulan yang sudah lewat.
  await ensureMonthlyAwards();

  const [user, achievements, playedKeys] = await Promise.all([
    getCurrentUser(),
    getAchievementsMap(),
    getPlayedPeriodKeys(),
  ]);
  const reveal = Boolean(user);

  const periodKeys = [...new Set([current.key, ...playedKeys])].sort((a, b) =>
    b.localeCompare(a),
  );
  const periodOptions: PeriodOption[] = periodKeys.map((key) => ({
    value: key,
    label: getPeriod(key).label,
  }));

  if (allMode) {
    const rows = await getStandings();

    return (
      <LeaderboardShell
        reveal={reveal}
        userExists={Boolean(user)}
        mode="all"
        periodKey={current.key}
        periodOptions={periodOptions}
        title="Pang-Giatna Ngabinton"
        subtitle="All Of Time"
        body={
          rows.length > 0 ? (
            <LeaderboardTable rows={rows} reveal={reveal} achievements={achievements} />
          ) : (
            <EmptyState hasUser={Boolean(user)} />
          )
        }
      />
    );
  }

  const gameCount = await countMatchesInPeriod(period);

  if (gameCount > 0) {
    const rows = await getMonthlyStandings(period);
    return (
      <LeaderboardShell
        reveal={reveal}
        userExists={Boolean(user)}
        mode="month"
        periodKey={period.key}
        periodOptions={periodOptions}
        title="Pang-Giatna Ngabinton"
        subtitle={period.label}
        body={<LeaderboardTable rows={rows} reveal={reveal} achievements={achievements} />}
      />
    );
  }

  // Tidak ada game di periode terpilih. Untuk bulan berjalan, tampilkan juara bulan sebelumnya.
  const awardsPeriod = selectedPeriod ?? previousPeriod();
  const [awards, awardRows] = await Promise.all([
    getAchievementsForPeriod(awardsPeriod.key),
    getMonthlyStandings(awardsPeriod),
  ]);

  const byKey = new Map(awardRows.map((row) => [row.key, row]));
  const toEntry = (achievement: (typeof awards)[number]): AwardEntry => ({
    achievement,
    standing: byKey.get(achievement.subjectKey) ?? null,
  });

  const ace = awards
    .filter((achievement) => achievement.type === "ace_of_month")
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .map(toEntry);
  const tangguh = awards
    .filter((achievement) => achievement.type === "pang_tangguh_of_month")
    .map(toEntry);

  return (
    <LeaderboardShell
      reveal={reveal}
      userExists={Boolean(user)}
      mode="month"
      periodKey={period.key}
      periodOptions={periodOptions}
      title="Pang-Giatna Ngabinton"
      subtitle={period.label}
      body={
        <div className="flex flex-col gap-8">
          <div className="rounded-lg border border-border bg-background-elevated p-5">
            <p className="font-semibold text-text">Belum ada game di {period.label}.</p>
            {selectedPeriod ? null : (
              <p className="mt-1 text-sm text-text-muted">
                Sambil menunggu sesi pertama bulan ini, ini para juara {awardsPeriod.label}.
              </p>
            )}
            <p className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link href="/sesi" className="text-primary underline-offset-4 hover:underline">
                Lihat jadwal sesi →
              </Link>
              <Link
                href="/leaderboard?periode=all"
                className="text-text-muted underline-offset-4 hover:text-text hover:underline"
              >
                Lihat All Of Time →
              </Link>
            </p>
          </div>

          {ace.length > 0 || tangguh.length > 0 ? (
            <MonthlyAwards
              periodLabel={awardsPeriod.label}
              ace={ace}
              tangguh={tangguh}
              reveal={reveal}
            />
          ) : (
            <EmptyState hasUser={Boolean(user)} />
          )}
        </div>
      }
    />
  );
}

function LeaderboardShell({
  reveal,
  userExists,
  mode,
  periodKey,
  periodOptions,
  title,
  subtitle,
  body,
}: {
  reveal: boolean;
  userExists: boolean;
  mode: "month" | "all";
  periodKey: string;
  periodOptions: PeriodOption[];
  title: string;
  subtitle: string;
  body: React.ReactNode;
}) {
  return (
    <div className="pb-24 pt-28">
      <Container size="xl">
        <header>
          <p className="text-xs uppercase tracking-[0.04em] text-primary">Papan Peringkat</p>
          <h1 className="mt-2 font-display text-4xl text-text md:text-6xl">{title}</h1>
          <p className="mt-1 text-sm uppercase tracking-[0.04em] text-text-muted">{subtitle}</p>
          <p className="mt-4 max-w-6xl text-text-secondary">
            Setiap set yang dimainkan menghasilkan EXP:{" "}
            <span className="font-semibold text-text">menang +{EXP_WIN_PER_SET}</span>,{" "}
            <span className="font-semibold text-text">kalah +{EXP_LOSS_PER_SET}</span>. Peringkat bulanan dihitung dari game yang tercatat di bulan berjalan.
          </p>
          {!reveal ? (
            <p className="mt-3 text-sm text-text-muted">
              Nama disensor untuk pengunjung.{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Masuk
              </Link>{" "}
              untuk melihat nama lengkap, badge, dan profil anggota.
            </p>
          ) : null}
        </header>

        <div className="mt-6">
          <PeriodToggle mode={mode} periodKey={periodKey} options={periodOptions} />
        </div>

        <div className="mt-8">{body}</div>

        <p className="mt-6 text-sm text-text-muted">
          {userExists ? (
            <Link href="/member" className={buttonClass("ghost", "sm")}>
              Buka area anggota
            </Link>
          ) : null}
        </p>
      </Container>
    </div>
  );
}

function EmptyState({ hasUser }: { hasUser: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-8 text-center">
      <p className="font-semibold text-text">Belum ada data EXP.</p>
      <p className="mt-2 text-sm text-text-muted">
        Pang-Giatna Ngabinton muncul setelah sesi &amp; pertandingan dicatat.
      </p>
      {hasUser ? (
        <p className="mt-4">
          <Link href="/member" className={buttonClass("ghost", "sm")}>
            Buka area anggota
          </Link>
        </p>
      ) : null}
    </div>
  );
}
