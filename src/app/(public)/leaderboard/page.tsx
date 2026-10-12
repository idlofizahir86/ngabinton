import type { Metadata } from "next";
import Link from "next/link";

import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";
import { getLeaderboard } from "@/lib/api/members";
import { getCurrentUser } from "@/lib/auth/guards";
import { EXP_LOSS_PER_SET, EXP_WIN_PER_SET } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pang-Giatna Ngabinton — NGABINTON",
  description:
    "Papan peringkat EXP anggota club NGABINTON dari setiap set yang dimainkan tiap sesi mabar.",
};

export const revalidate = 0;

/** Halaman leaderboard EXP — publik, nama disensor untuk tamu (RULES.md §13.3). */
export default async function LeaderboardPage() {
  const [rows, user] = await Promise.all([getLeaderboard(), getCurrentUser()]);
  const reveal = Boolean(user);

  return (
    <div className="pb-24 pt-28">
      <Container size="xl">
        <header>
          <p className="text-xs uppercase tracking-[0.04em] text-primary">Papan Peringkat</p>
          <h1 className="mt-2 font-display text-4xl text-text md:text-6xl">Pang-Giatna Ngabinton</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Setiap set yang dimainkan menghasilkan EXP:{" "}
            <span className="font-semibold text-text">menang +{EXP_WIN_PER_SET}</span>,{" "}
            <span className="font-semibold text-text">kalah +{EXP_LOSS_PER_SET}</span>. Semakin
            sering mabar, semakin naik peringkatmu.
          </p>
          {!reveal ? (
            <p className="mt-3 text-sm text-text-muted">
              Nama anggota disensor untuk pengunjung.{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Masuk
              </Link>{" "}
              untuk melihat nama lengkap.
            </p>
          ) : null}
        </header>

        <div className="mt-10">
          {rows.length > 0 ? (
            <LeaderboardTable rows={rows} reveal={reveal} />
          ) : (
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <p className="font-semibold text-text">Belum ada data EXP.</p>
              <p className="mt-2 text-sm text-text-muted">
                Pang-Giatna Ngabinton muncul setelah pengurus mencatat sesi &amp; pertandingan.
              </p>
              {user ? (
                <p className="mt-4">
                  <Link href="/member" className={buttonClass("ghost", "sm")}>
                    Buka area anggota
                  </Link>
                </p>
              ) : null}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
