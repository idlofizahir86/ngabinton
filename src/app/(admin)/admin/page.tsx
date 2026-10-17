import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";
import { getFinanceTotals } from "@/lib/api/finance";
import { getPlaySessions } from "@/lib/api/matches";
import { getLeaderboard } from "@/lib/api/members";
import {
  getCurrentUser,
  getUserMenus,
  isAdminRole,
  requireUser,
} from "@/lib/auth/guards";
import { formatRupiah } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Dashboard Admin — NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

function totalMatches(sessions: { matchCount: number }[]): number {
  return sessions.reduce((sum, session) => sum + session.matchCount, 0);
}

/** Dashboard admin/staf — ringkasan & pintasan sesuai menu yang di-assign. */
export default async function AdminDashboardPage() {
  await requireUser();
  const user = await getCurrentUser();

  if (!user) redirect("/member");

  const menus = await getUserMenus(user);
  const isAdmin = isAdminRole(user.role);
  const can = (menu: (typeof menus)[number]) => isAdmin || menus.includes(menu);

  const [sessions, members, finance] = await Promise.all([
    can("matches") ? getPlaySessions() : Promise.resolve([]),
    can("members") || isAdmin ? getLeaderboard() : Promise.resolve([]),
    can("finance") ? getFinanceTotals() : Promise.resolve(null),
  ]);

  return (
    <Container size="xl">
      <header>
        <p className="text-xs uppercase tracking-[0.04em] text-primary">
          {isAdmin ? "Admin" : "Staf"}
        </p>
        <h1 className="mt-1 font-display text-4xl text-text">
          Halo, {user.nickname || user.displayName}
        </h1>
        <p className="mt-2 text-text-muted">
          {isAdmin
            ? "Kelola sesi bermain, catat pertandingan, keuangan, dan anggota club."
            : "Ini menu yang dipercayakan admin kepadamu."}
        </p>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {can("members") ? <Stat label="Anggota" value={String(members.length)} /> : null}
        {can("matches") ? (
          <>
            <Stat label="Sesi Bermain" value={String(sessions.length)} />
            <Stat label="Game Tercatat" value={String(totalMatches(sessions))} />
            <Stat
              label="Peserta Aktif"
              value={String(members.filter((member) => member.stats.games > 0).length)}
            />
          </>
        ) : null}
        {finance ? <Stat label="Saldo Kas" value={formatRupiah(finance.balance)} /> : null}
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {can("matches") ? (
          <MenuCard
            title="Sesi Bermain"
            body="Buat sesi (contoh: “Sesi Ngabinton 12 Oktober 2026”), lalu catat tiap game di dalamnya."
            href="/admin/sesi"
            cta="Kelola Sesi"
            primary
          />
        ) : null}
        {can("finance") ? (
          <MenuCard
            title="Keuangan"
            body="Catat iuran sesi, pemasukan kas, dan pengeluaran. Saldo terlihat transparan oleh anggota."
            href="/admin/keuangan"
            cta="Buka Keuangan"
            primary={!can("matches")}
          />
        ) : null}
        {can("members") ? (
          <MenuCard
            title="Anggota Club"
            body="Tambah anggota, atur status aktif, dan konversi BaturanNgabinton agar EXP-nya masuk Pang-Giatna."
            href="/admin/anggota"
            cta="Kelola Anggota"
          />
        ) : null}
        {isAdmin ? (
          <>
            <MenuCard
              title="Pencapaian"
              body="Buat badge kustom, berikan ke anggota, dan lihat aturan badge otomatis."
              href="/admin/pencapaian"
              cta="Kelola Pencapaian"
            />
            <MenuCard
              title="Akses Menu"
              body="Berikan akses keuangan atau pencatatan pertandingan ke anggota yang kamu percaya."
              href="/admin/akses"
              cta="Atur Akses"
            />
          </>
        ) : null}
      </section>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.04em] text-text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl text-text">{value}</p>
    </div>
  );
}

function MenuCard({
  title,
  body,
  href,
  cta,
  primary = false,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  primary?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-2 text-sm text-text-muted">{body}</p>
      <Link href={href} className={buttonClass(primary ? "primary" : "ghost", "sm", "mt-4")}>
        {cta}
      </Link>
    </div>
  );
}
