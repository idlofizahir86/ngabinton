import Image from "next/image";
import Link from "next/link";

import { EventMetaBar } from "@/components/event/event-meta-bar";
import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";
import type { Event, EventStatus } from "@/lib/types/event";
import { getVolumeLabel } from "@/lib/utils/event-label";
import { formatDate, formatRupiah } from "@/lib/utils/format";

export type EventHeroProps = {
  event: Event;
  status: EventStatus;
};

/** Rentang waktu kumpul → pulang, mis. "06.00 WIB – 18.00 WIB" (RULES.md §8.2). */
function formatTimeRange(start: string | null, end: string | null): string | null {
  if (start && end) return `${start} – ${end}`;
  return start ?? end ?? null;
}

/** Item metadata bar: tanggal · waktu · lokasi · biaya (COMPONENTS.md §3.1). */
function buildMetaItems(event: Event): string[] {
  return [
    formatDate(event.startsAt),
    formatTimeRange(event.meetingTime, event.returnTime),
    event.location,
    event.price !== null ? formatRupiah(event.price) : null,
  ].filter((item): item is string => Boolean(item));
}

type PrimaryCta = {
  href: string;
  label: string;
  live: boolean;
};

/**
 * CTA utama sesuai state event (RULES.md §2.3).
 * Catatan: belum ada alur pendaftaran di stack ini, jadi state `upcoming`
 * diarahkan ke rundown (bukan "Daftar Sekarang") — lihat TASK.md ❓ QUESTION.
 */
function getPrimaryCta(event: Event, status: EventStatus): PrimaryCta {
  if (status === "live") {
    return { href: `/${event.slug}/absen`, label: "Presensi Sekarang", live: true };
  }
  if (status === "past") {
    return { href: "#peserta", label: "Lihat Dokumentasi", live: false };
  }
  return { href: "#rundown", label: "Lihat Rundown", live: false };
}

/**
 * Hero event varian cinema — COMPONENTS.md §3.1.
 * Hanya untuk `event_type` badminton/gathering; travel memakai `<TravelHero />` (M5).
 * Server Component.
 */
export function EventHero({ event, status }: EventHeroProps) {
  const volume = getVolumeLabel(event.title);
  const metaItems = buildMetaItems(event);
  const primary = getPrimaryCta(event, status);
  const showRundownGhost = primary.href !== "#rundown";

  return (
    <section
      id="hero"
      className="relative flex min-h-[70vh] items-end overflow-hidden md:min-h-[80vh]"
    >
      {event.heroImageUrl ? (
        <Image
          src={event.heroImageUrl}
          alt={event.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-surface" />
      )}

      {/* Overlay gradient (DESIGN.md §7.2) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,20,0.35)_0%,rgba(20,20,20,0.75)_65%,#141414_100%)]"
      />

      <Container size="lg" className="relative py-20 md:py-24">
        {volume ? (
          <span className="inline-block rounded-sm bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-on-primary">
            {volume}
          </span>
        ) : null}

        <h1 className="mt-4 font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-text md:text-[72px]">
          {event.title}
        </h1>

        {event.subtitle ? (
          <p className="mt-3 max-w-2xl text-lg font-semibold text-text-secondary md:text-xl">
            {event.subtitle}
          </p>
        ) : null}

        <div className="mt-5">
          <EventMetaBar items={metaItems} />
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href={primary.href} className={buttonClass("primary", "lg")}>
            {primary.live ? (
              <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-on-primary" />
            ) : null}
            {primary.label}
          </Link>

          {showRundownGhost ? (
            <Link href="#rundown" className={buttonClass("ghost", "lg")}>
              Lihat Rundown
            </Link>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
