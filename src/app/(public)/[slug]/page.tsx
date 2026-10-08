import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventHero } from "@/components/event/event-hero";
import { EventSubNav } from "@/components/event/event-sub-nav";
import { QuranQuote } from "@/components/event/quran-quote";
import { RundownTimeline } from "@/components/event/rundown-timeline";
import { Container } from "@/components/layout/container";
import { getEventBySlug } from "@/lib/api/events";
import { APP_URL } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { getEventStatus } from "@/lib/utils/event-status";
import { formatDate, formatRupiah } from "@/lib/utils/format";
import {
  EVENT_EXTRA_KEYS,
  getEventExtra,
  quranVerseSchema,
} from "@/lib/validators/event-extras";

/** Halaman event di-render ulang tiap 60 detik (ROUTES.md §1.1). */
export const revalidate = 60;

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

/** Fallback deskripsi kalau event tidak punya `subtitle`/`description` (RULES.md §6.3). */
const DEFAULT_DESCRIPTION =
  "Komunitas badminton mingguan yang suka kumpul, main bareng, dan sesekali jalan-jalan.";

/** Minimum `metadataBase` kalau `NEXT_PUBLIC_APP_URL` belum diisi. */
const FALLBACK_APP_URL = "http://localhost:3000";

/** Label jenis event untuk metadata & header. */
const EVENT_TYPE_LABEL: Record<string, string> = {
  badminton: "Badminton",
  travel: "Travel",
  gathering: "Kumpul",
  other: "Event",
};

/**
 * Anchor sub-nav yang **sudah ada** di halaman (ROUTES.md §2.1).
 * Bertambah saat section storytelling (M5) & presensi (M6) menyusul.
 * Konstanta modul agar identitas array stabil (dipakai sebagai dep `useEffect`).
 */
/**
 * Anchor sub-nav yang **sudah ada** di halaman (ROUTES.md §2.1).
 * Bertambah saat section storytelling (M5) & presensi (M6) menyusul.
 * Konstanta modul agar identitas array stabil (dipakai sebagai dep `useEffect`).
 */
const CINEMA_ANCHORS = [
  { id: "hero", label: "Awal" },
  { id: "rundown", label: "Rundown" },
  { id: "biaya", label: "Biaya" },
];

/** Anchor tambahan untuk event storytelling (varian travel). */
const STORY_ANCHORS = [
  { id: "hero", label: "Awal" },
  { id: "pembuka", label: "Pembuka" },
  { id: "rundown", label: "Rundown" },
  { id: "biaya", label: "Biaya" },
];

/**
 * Metadata SEO per event (RULES.md §6.3).
 * Title: `{Judul Event} — NGABINTON` · description dari `subtitle` · OG dari cover.
 */
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Halaman tidak ditemukan — NGABINTON" };
  }

  const title = `${event.title} — NGABINTON`;
  const description = event.subtitle ?? event.description ?? DEFAULT_DESCRIPTION;
  const ogImage = event.coverImageUrl ?? "/og/default.jpg";

  return {
    metadataBase: new URL(APP_URL ?? FALLBACK_APP_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/${event.slug}`,
      images: [{ url: ogImage }],
    },
  };
}

/**
 * Halaman event publik `/[slug]` — ROUTES.md §2.
 *
 * Hero cinema memakai `<EventHero />` (M4-03); event storytelling masih memakai
 * blok sementara sampai `<TravelHero />` (M5). Section `#rundown` (M4-07) &
 * `#biaya` (M4-08, versi minimal) sudah ada; section storytelling (M5) menyusul.
 */
export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const typeLabel = EVENT_TYPE_LABEL[event.eventType] ?? EVENT_TYPE_LABEL.other;
  const isCinema = event.theme === "cinema";
  const variant = isCinema ? "cinema" : "storytelling";
  const status = getEventStatus(event);
  const hasRundown = event.rundownItems.length > 0;
  const hasBudget = event.budgetItems.length > 0;
  const totalBudget =
    event.budgetItems.find((item) => item.isTotal)?.amount ?? event.price ?? null;
  const quranVerse = getEventExtra(event.extras, EVENT_EXTRA_KEYS.quranVerse, quranVerseSchema);
  const anchors = isCinema ? CINEMA_ANCHORS : STORY_ANCHORS;

  return (
    <article className="pb-24">
      {isCinema ? (
        <EventHero event={event} status={status} />
      ) : (
        /* Blok sementara untuk event storytelling — digantikan `<TravelHero />` (M5). */
        <section id="hero" className="border-b border-border/60">
          <Container size="lg" className="py-24 md:py-32">
            <p className="text-xs uppercase tracking-[0.04em] text-text-subtle">
              {typeLabel} · {formatDate(event.startsAt)}
            </p>

            <h1 className="mt-3 font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-text md:text-[64px]">
              {event.title}
            </h1>

            {event.subtitle ? (
              <p className="mt-4 max-w-2xl text-lg font-semibold text-text-secondary md:text-xl">
                {event.subtitle}
              </p>
            ) : null}

            {event.description ? (
              <p className="mt-3 max-w-2xl text-base text-text-muted">{event.description}</p>
            ) : null}
          </Container>
        </section>
      )}

      <EventSubNav anchors={anchors} variant={variant} />

      {!isCinema && quranVerse ? (
        <QuranQuote
          arabic={quranVerse.arabic}
          translation={quranVerse.translation}
          source={quranVerse.source}
        />
      ) : null}

      {hasRundown ? (
        /*
         * Rundown selalu varian **gelap/cinema** (DESIGN.md §2: "Rundown (gelap, kontras)"),
         * apa pun tema event-nya.
         */
        <section id="rundown" className="scroll-mt-32 border-b border-border/60 py-20 md:py-24">
          <Container size={isCinema ? "lg" : "md"}>
            <h2 className="font-display text-3xl text-text md:text-4xl">Rundown</h2>

            <div className="mt-8">
              <RundownTimeline
                items={event.rundownItems}
                variant="cinema"
                highlightNow={status === "live"}
              />
            </div>
          </Container>
        </section>
      ) : null}

      {/*
       * Section biaya — versi minimal (M4-08). Diisi penuh dengan `<BudgetTable />`
       * + info pembayaran di M5-05. Copy dari CONTENT.md §4.9.
       */}
      {hasBudget ? (
        <section
          id="biaya"
          className={cn(
            "scroll-mt-32 border-b py-20 md:py-24",
            isCinema
              ? "border-border/60 bg-background"
              : "border-story-border bg-story-bg",
          )}
        >
          <Container size={isCinema ? "lg" : "md"}>
            <h2
              className={cn(
                "font-display text-3xl md:text-4xl",
                isCinema ? "text-text" : "text-story-text",
              )}
            >
              Biaya
            </h2>

            <p
              className={cn(
                "mt-4 max-w-2xl text-base",
                isCinema ? "text-text-muted" : "text-story-muted",
              )}
            >
              Sudah termasuk semua. Tinggal bawa uang jajan tambahan buat oleh-oleh.
            </p>

            {totalBudget !== null ? (
              <p className="mt-8">
                <span
                  className={cn(
                    "font-display text-4xl md:text-5xl",
                    isCinema ? "text-text" : "text-story-text",
                  )}
                >
                  {formatRupiah(totalBudget)}
                </span>
                <span className={cn("ml-2 text-base", isCinema ? "text-text-muted" : "text-story-muted")}>
                  / orang
                </span>
              </p>
            ) : null}
          </Container>
        </section>
      ) : null}
    </article>
  );
}
