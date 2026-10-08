import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventHero } from "@/components/event/event-hero";
import { EventSections } from "@/components/event/event-sections";
import { EventSubNav } from "@/components/event/event-sub-nav";
import { Container } from "@/components/layout/container";
import { getEventBySlug } from "@/lib/api/events";
import { APP_URL } from "@/lib/constants";
import { CINEMA_ANCHORS, EVENT_TYPE_LABEL, STORY_ANCHORS } from "@/lib/event-content";
import { getEventStatus } from "@/lib/utils/event-status";
import { formatDate } from "@/lib/utils/format";
import { parseEventExtras } from "@/lib/validators/event-extras";

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

  const isCinema = event.theme === "cinema";
  const variant = isCinema ? "cinema" : "storytelling";
  const status = getEventStatus(event);
  const typeLabel = EVENT_TYPE_LABEL[event.eventType] ?? EVENT_TYPE_LABEL.other;
  const anchors = isCinema ? CINEMA_ANCHORS : STORY_ANCHORS;
  const extras = parseEventExtras(event.extras);

  return (
    <article className="pb-24">
      {isCinema ? (
        <EventHero event={event} status={status} />
      ) : (
        /* Blok sementara untuk event storytelling — `<TravelHero />` belum dibuat. */
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

      <EventSections event={event} extras={extras} status={status} variant={variant} />
    </article>
  );
}
