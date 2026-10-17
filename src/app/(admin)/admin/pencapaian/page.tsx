import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Coins,
  Crown,
  Flame,
  Megaphone,
  Sparkles,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";

import { runAchievementSyncAction, toggleAchievementDefinitionAction } from "@/actions/achievement-admin";
import { AchievementDefinitionForm } from "@/components/admin/achievement-definition-form";
import { CustomAwardForm } from "@/components/admin/custom-award-form";
import { EventOrganizerForm } from "@/components/admin/event-organizer-form";
import { RemoveOrganizerButton } from "@/components/admin/remove-organizer-button";
import { RevokeAchievementButton } from "@/components/admin/revoke-achievement-button";
import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";
import { getAchievementDefinitions, getRecentCustomAwards } from "@/lib/api/achievement-definitions";
import { getEventOptions, getEventOrganizers } from "@/lib/api/event-organizers";
import { getMemberOptions } from "@/lib/api/matches";
import { requireAdmin } from "@/lib/auth/guards";
import {
  ACE_MONTHLY_LIMIT,
  ACE_STREAK_MILESTONES,
  DUES_DILIGENCE_WINDOW,
  EXP_MILESTONES,
  PANG_TANGGUH_MIN_SESSIONS,
  SESSION_MILESTONES,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Pencapaian — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

const RULES = [
  {
    icon: Crown,
    title: "ACE Of The Month",
    body: `${ACE_MONTHLY_LIMIT} EXP tertinggi setiap bulan. Dihitung otomatis saat bulan selesai.`,
  },
  {
    icon: Flame,
    title: "Pang-Tangguh Of The Month",
    body: `Sesi terbanyak di bulan itu; bila seri, EXP terendah. Minimal ${PANG_TANGGUH_MIN_SESSIONS} sesi. Boleh lebih dari satu penerima bila EXP sama.`,
  },
  {
    icon: Zap,
    title: "Milestone EXP",
    body: `Otomatis saat total EXP mencapai ${EXP_MILESTONES.join(" / ")}.`,
  },
  {
    icon: Trophy,
    title: "Milestone Sesi",
    body: `Otomatis saat jumlah sesi mencapai ${SESSION_MILESTONES.join(" / ")}.`,
  },
  {
    icon: Award,
    title: "Kemenangan Pertama",
    body: "Otomatis untuk pemain yang memenangkan set pertamanya.",
  },
  {
    icon: TrendingUp,
    title: "ACE Streak",
    body: `Otomatis saat meraih ACE ${ACE_STREAK_MILESTONES.join(" / ")} bulan berturut-turut.`,
  },
  {
    icon: Coins,
    title: "Rajin Iuran",
    body: `Pembayar iuran paling rajin dalam ${DUES_DILIGENCE_WINDOW} bulan terakhir — dihitung ulang per bulan.`,
  },
  {
    icon: Wallet,
    title: "Yang Urus Duit Bersama",
    body: "Otomatis untuk anggota yang diberi akses menu Keuangan (dicabut saat aksesnya dicabut).",
  },
  {
    icon: Megaphone,
    title: "EO Event",
    body: "Otomatis untuk anggota yang ditetapkan sebagai penanggung jawab sebuah event.",
  },
];

/** Admin: kelola badge kustom & aturan pencapaian otomatis (RULES.md §13.7). */
export default async function AdminAchievementsPage() {
  await requireAdmin();
  const [definitions, members, awards, eventOptions, organizers] = await Promise.all([
    getAchievementDefinitions(),
    getMemberOptions(),
    getRecentCustomAwards(),
    getEventOptions(),
    getEventOrganizers(),
  ]);

  const memberOptions = members.map((member) => ({
    id: member.id,
    name: member.nickname || member.displayName,
  }));
  const activeDefinitions = definitions
    .filter((definition) => definition.isActive)
    .map((definition) => ({ id: definition.id, name: definition.name }));

  return (
    <Container size="xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.04em] text-primary">Admin</p>
          <h1 className="mt-1 font-display text-4xl text-text">Pencapaian</h1>
          <p className="mt-2 max-w-3xl text-text-muted">
            Badge otomatis mengikuti aturan di bawah. Badge kustom dibuat manual dan bisa diberikan
            ke anggota kapan saja.
          </p>
        </div>
        <form action={runAchievementSyncAction}>
          <button type="submit" className={buttonClass("ghost", "sm")}>
            <Sparkles className="h-4 w-4" />
            Sinkronkan Badge Otomatis
          </button>
        </form>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-text">Aturan Otomatis</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {RULES.map((rule) => {
            const Icon = rule.icon;
            return (
              <li key={rule.title} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <p className="font-semibold text-text">{rule.title}</p>
                </div>
                <p className="mt-2 text-sm text-text-muted">{rule.body}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">Penanggung Jawab Event (EO)</h2>
          <p className="mt-1 text-sm text-text-muted">
            Anggota yang ditetapkan di sini otomatis mendapat badge <strong>EO · judul event</strong>.
            Badge keuangan otomatis diberikan saat anggota diberi akses menu Keuangan di{" "}
            <Link href="/admin/akses" className="text-primary underline-offset-4 hover:underline">
              Akses Menu
            </Link>
            .
          </p>
          <div className="mt-5">
            <EventOrganizerForm
              events={eventOptions.map((event) => ({ id: event.id, title: event.title }))}
              members={memberOptions}
            />
          </div>

          {organizers.length > 0 ? (
            <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
              {organizers.map((organizer) => (
                <li
                  key={organizer.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text">
                      {organizer.userName}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      EO · {organizer.eventTitle}
                    </p>
                  </div>
                  <RemoveOrganizerButton
                    organizerId={organizer.id}
                    label={`${organizer.userName} — ${organizer.eventTitle}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-lg border border-border bg-background-elevated p-4 text-sm text-text-muted">
              Belum ada EO event.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">Buat Badge Kustom</h2>
          <p className="mt-1 text-sm text-text-muted">
            Badge manual, mis. “Juara Internal”, “Paling Semangat”, atau “Panitia Event”.
          </p>
          <div className="mt-5">
            <AchievementDefinitionForm />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text">Beri Badge ke Anggota</h2>
          <p className="mt-1 text-sm text-text-muted">
            Satu anggota hanya bisa menerima badge yang sama satu kali. Badge bisa dicabut.
          </p>
          <div className="mt-5">
            <CustomAwardForm members={memberOptions} definitions={activeDefinitions} />
          </div>
        </section>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-text">Badge Kustom ({definitions.length})</h2>
          {definitions.length === 0 ? (
            <p className="mt-4 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
              Belum ada badge kustom. Buat yang pertama di form atas.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {definitions.map((definition) => (
                <li
                  key={definition.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-surface p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-text">{definition.name}</p>
                      <span className="rounded-pill bg-surface-hover px-2 py-0.5 font-mono text-[10px] text-text-muted">
                        {definition.code}
                      </span>
                      {!definition.isActive ? (
                        <span className="rounded-pill bg-warning/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.04em] text-warning">
                          Nonaktif
                        </span>
                      ) : null}
                    </div>
                    {definition.description ? (
                      <p className="mt-1 text-sm text-text-muted">{definition.description}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-text-subtle">
                      Ikon {definition.icon} · Warna {definition.tone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/pencapaian/${definition.id}/edit`}
                      className={buttonClass("ghost", "sm")}
                    >
                      Ubah
                    </Link>
                    <form action={toggleAchievementDefinitionAction}>
                      <input type="hidden" name="definitionId" value={definition.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-border px-3 py-2 text-sm text-text-muted transition hover:bg-surface-hover hover:text-text"
                      >
                        {definition.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text">Badge Kustom Terbaru ({awards.length})</h2>
          {awards.length === 0 ? (
            <p className="mt-4 rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
              Belum ada badge kustom yang diberikan.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface">
              {awards.map((award) => (
                <li key={award.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-text">{award.label}</p>
                    <p className="text-xs text-text-muted">
                      {award.memberName ?? "Anggota"} · {formatDate(award.awardedAt)}
                    </p>
                    {award.note ? (
                      <p className="mt-0.5 truncate text-xs text-text-subtle">{award.note}</p>
                    ) : null}
                  </div>
                  <RevokeAchievementButton achievementId={award.id} label={award.label} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Container>
  );
}
