import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { MonthFilter } from "@/components/layout/month-filter";
import { AchievementList } from "@/components/member/achievement-list";
import { MatchHistoryList } from "@/components/member/history-list";
import { MemberAvatar } from "@/components/member/member-avatar";
import { MemberCard } from "@/components/member/member-card";
import { buttonClass } from "@/components/ui/button";
import { getAchievementsForUser } from "@/lib/api/achievements";
import {
  getMemberByUsername,
  getMemberHistory,
  getMemberPeriodKeys,
  getMemberStats,
} from "@/lib/api/members";
import { getStandings, rankFromStandings } from "@/lib/api/rankings";
import { getCurrentUser } from "@/lib/auth/guards";
import { maskName } from "@/lib/members/name";
import { getPeriod, isValidPeriodKey, periodOptionsFromDates } from "@/lib/utils/period";

export const revalidate = 0;

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ periode?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `Profil ${username} — NGABINTON`,
    robots: { index: false },
  };
}

/** Profil publik anggota (`/u/[username]`) — nama disensor untuk pengunjung. */
export default async function PublicMemberPage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const query = await searchParams;
  const selectedPeriod = isValidPeriodKey(query.periode) ? getPeriod(query.periode) : null;

  const [member, viewer, standings] = await Promise.all([
    getMemberByUsername(username),
    getCurrentUser(),
    getStandings(),
  ]);

  if (!member) {
    notFound();
  }

  const reveal = Boolean(viewer);
  const [stats, history, achievements, historyPeriodKeys] = await Promise.all([
    getMemberStats(member.id),
    getMemberHistory(member.id, {
      from: selectedPeriod?.start,
      to: selectedPeriod?.end,
    }),
    getAchievementsForUser(member.id),
    getMemberPeriodKeys(member.id),
  ]);

  const rank = rankFromStandings(standings, member.id);
  const standing = standings.find((row) => row.userId === member.id);
  const rawName = member.nickname || member.displayName;
  const displayName = reveal ? rawName : maskName(rawName);
  const displayUsername = reveal ? member.username : maskName(member.username);

  return (
    <div className="pb-24 pt-28">
      <Container size="lg">
        <Link href="/leaderboard" className="text-sm text-text-muted transition hover:text-text">
          ← Pang-Giatna Ngabinton
        </Link>

        <header className="mt-5 flex flex-wrap items-center gap-5">
          <MemberAvatar
            name={rawName}
            avatarKey={member.avatarKey}
            avatarUrl={member.avatarUrl}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.04em] text-primary">Profil Anggota</p>
            <h1 className="mt-1 truncate font-display text-4xl text-text">{displayName}</h1>
            <p className="text-sm text-text-muted">@{displayUsername}</p>
          </div>
          {reveal ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              {viewer?.id === member.id ? (
                <Link href="/member/profil" className={buttonClass("ghost", "sm")}>
                  Edit Profil
                </Link>
              ) : null}
              <a
                href={`/api/member-card/${member.username}`}
                className={buttonClass("primary", "sm")}
              >
                Unduh Member Card
              </a>
            </div>
          ) : null}
        </header>

        {!reveal ? (
          <p className="mt-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            Nama disensor untuk pengunjung.{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Masuk
            </Link>{" "}
            untuk melihat profil lengkap dan mengunduh kartu anggota.
          </p>
        ) : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="EXP" value={String(member.exp)} accent />
            <Stat label="Peringkat" value={`#${rank}`} />
            <Stat label="Sesi" value={String(standing?.stats.sessions ?? stats.games)} />
            <Stat label="Game" value={String(stats.games)} />
            <Stat label="Set Menang" value={`${stats.setsWon}/${stats.setsPlayed}`} />
            <Stat
              label="Win Rate"
              value={
                stats.setsPlayed > 0
                  ? `${Math.round((stats.setsWon / stats.setsPlayed) * 100)}%`
                  : "—"
              }
            />
          </div>

          <MemberCard
            member={{
              displayName: member.displayName,
              nickname: member.nickname,
              username: member.username,
              avatarKey: member.avatarKey,
              avatarUrl: member.avatarUrl,
              exp: member.exp,
              rank,
              sessions: standing?.stats.sessions ?? 0,
              games: stats.games,
              achievements,
            }}
            reveal={reveal}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text">Pencapaian</h2>
          <p className="mt-1 text-sm text-text-muted">
            Badge dari Pang-Giatna bulanan, milestone, dan kemenangan pertama.
          </p>
          <div className="mt-4">
            <AchievementList achievements={achievements} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text">Riwayat Main</h2>
          <div className="mt-4">
            <MonthFilter
              action={`/u/${member.username}`}
              value={selectedPeriod?.key ?? ""}
              options={periodOptionsFromDates(
                historyPeriodKeys.map((key) => getPeriod(key).start),
              )}
              allOption={{ value: "", label: "Semua bulan" }}
            />
          </div>
          <div className="mt-5">
            <MatchHistoryList entries={history} reveal={reveal} />
          </div>
        </section>
      </Container>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.04em] text-text-muted">{label}</p>
      <p
        className={
          accent
            ? "mt-1 font-display text-2xl tabular-nums text-primary"
            : "mt-1 font-display text-2xl tabular-nums text-text"
        }
      >
        {value}
      </p>
    </div>
  );
}
