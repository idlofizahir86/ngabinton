"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { EventCard } from "@/components/event/event-card";
import { Container } from "@/components/layout/container";
import type { Event } from "@/lib/types/event";

const ARROW_ICON_CLASS = "h-6 w-6";

/** Porsi lebar container yang di-scroll tiap klik panah. */
const SCROLL_RATIO = 0.8;

/** Panah hanya muncul kalau kartu ≥ jumlah ini (COMPONENTS.md §3.4). */
const MIN_CARDS_FOR_ARROWS = 3;

export type EventCarouselProps = {
  title: string;
  events: Event[];
  seeAllHref?: string;
};

/** Row carousel horizontal (Netflix style) — COMPONENTS.md §3.4. */
export function EventCarousel({ title, events, seeAllHref }: EventCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const showArrows = events.length >= MIN_CARDS_FOR_ARROWS;

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * SCROLL_RATIO, behavior: "smooth" });
  };

  return (
    <section className="group/carousel relative">
      <Container size="full">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-text md:text-2xl">{title}</h2>
          {seeAllHref ? (
            <Link
              href={seeAllHref}
              className="text-sm text-text-muted transition duration-150 ease-brand hover:text-text"
            >
              Lihat semua →
            </Link>
          ) : null}
        </div>
      </Container>

      {events.length === 0 ? (
        <Container size="full">
          <p className="mt-4 text-sm text-text-muted">Belum ada event. Pantengin terus ya!</p>
        </Container>
      ) : (
        <div className="relative mt-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-[linear-gradient(to_right,var(--color-background),transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-[linear-gradient(to_left,var(--color-background),transparent)]"
          />

          {showArrows ? (
            <>
              <button
                type="button"
                aria-label="Geser ke kiri"
                onClick={() => scrollBy(-1)}
                className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-surface text-text opacity-0 transition duration-150 ease-brand hover:bg-surface-hover focus-visible:opacity-100 group-hover/carousel:opacity-100 md:inline-flex"
              >
                <ChevronLeft className={ARROW_ICON_CLASS} />
              </button>
              <button
                type="button"
                aria-label="Geser ke kanan"
                onClick={() => scrollBy(1)}
                className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-surface text-text opacity-0 transition duration-150 ease-brand hover:bg-surface-hover focus-visible:opacity-100 group-hover/carousel:opacity-100 md:inline-flex"
              >
                <ChevronRight className={ARROW_ICON_CLASS} />
              </button>
            </>
          ) : null}

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:px-6 lg:px-16"
          >
            {events.map((event) => (
              <div key={event.id} className="snap-start">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
