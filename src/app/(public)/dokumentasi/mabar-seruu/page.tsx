import type { Metadata } from "next";
import Link from "next/link";

import { DocumentationTabs } from "@/components/gallery/documentation-tabs";
import { StoryPlayer, type StoryGroup } from "@/components/gallery/story-player";
import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";
import { getApprovedStoryGroups } from "@/lib/api/session-media";
import { getCurrentUser } from "@/lib/auth/guards";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Mabar Seruu — NGABINTON",
  description:
    "Kumpulan foto dan video singkat keseruan mabar badminton komunitas NGABINTON.",
};

export const revalidate = 0;

/** Halaman "Mabar Seruu" — stories dokumentasi sesi mabar (ROUTES.md §3.4). */
export default async function MabarSeruuPage({
  searchParams,
}: {
  searchParams: Promise<{ sesi?: string }>;
}) {
  const [groups, user, params] = await Promise.all([
    getApprovedStoryGroups(),
    getCurrentUser(),
    searchParams,
  ]);

  const storyGroups: StoryGroup[] = groups.map((group) => ({
    sessionId: group.sessionId,
    title: group.title,
    playedAtLabel: group.playedAt ? formatDate(group.playedAt) : null,
    itemCount: group.items.length,
    items: group.items.map((item) => ({
      id: item.id,
      kind: item.kind,
      url: item.url,
      posterUrl: item.posterUrl,
      caption: item.caption,
      uploaderName: item.uploaderName,
    })),
  }));

  const total = storyGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="pb-24 pt-28">
      <Container size="full">
        <DocumentationTabs active="mabar" />

        <header className="mt-6 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.04em] text-primary">Arsip Dokumentasi</p>
          <h1 className="mt-2 font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-text md:text-[56px]">
            Mabar Seruu
          </h1>
          <p className="mt-4 text-base text-text-muted md:text-lg">
            Momen singkat dari sesi mabar: foto dan video 15 detik yang direkam langsung
            di lapangan. Semua momen tayang langsung — admin utama bisa menurunkannya
            bila perlu.
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-3">
            <Link href="/dokumentasi/mabar-seruu/unggah" className={buttonClass("primary", "sm")}>
              Rekam momen mabar
            </Link>
            {total > 0 ? (
              <span className="text-sm text-text-muted">
                {total} momen di {storyGroups.length} sesi
              </span>
            ) : null}
          </p>
          {!user ? (
            <p className="mt-3 text-sm text-text-muted">
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Masuk
              </Link>{" "}
              untuk merekam dan mengunggah momen.
            </p>
          ) : null}
        </header>

        <div className="mt-8">
          {storyGroups.length > 0 ? (
            <StoryPlayer groups={storyGroups} initialSessionId={params.sesi ?? null} />
          ) : (
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <p className="font-semibold text-text">Belum ada momen yang tayang.</p>
              <p className="mt-2 text-sm text-text-muted">
                Rekam foto atau video singkat saat mabar — momen langsung tayang di sini.
              </p>
              <p className="mt-4">
                <Link
                  href="/dokumentasi/mabar-seruu/unggah"
                  className={buttonClass("ghost", "sm")}
                >
                  Rekam momen pertama
                </Link>
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
