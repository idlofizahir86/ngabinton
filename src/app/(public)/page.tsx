import Image from "next/image";
import Link from "next/link";

import { EventCarousel } from "@/components/event/event-carousel";
import { ParticipantGrid } from "@/components/event/participant-grid";
import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";
import { getGalleryMedia, getPastTravelEvents, getUpcomingEvents } from "@/lib/api/events";

/** Landing di-render ulang tiap 60 detik (ROUTES.md §1.1). */
export const revalidate = 60;

/**
 * Latar hero landing — CONTENT.md §3.1 (aset `public/brand/hero-community.jpg`, `ASSETS.md` §1).
 * Set `null` kalau ingin latar gelap polos tanpa foto.
 */
const HERO_IMAGE_URL: string | null = "/brand/hero-community.jpg";

/** Metadata hero: jumlah member · tahun berdiri · kota (CONTENT.md §1.1). */
const HERO_META = ["~20 member", "Sejak 2025", "Bandung"];

/** Landing page — hero (M3-06) + section carousel (M3-07). */
export default async function Home() {
  const [upcoming, archive, gallery] = await Promise.all([
    getUpcomingEvents(),
    getPastTravelEvents(),
    getGalleryMedia(),
  ]);

  return (
    <>
      <section className="relative flex min-h-[70vh] items-center overflow-hidden md:min-h-[80vh]">
        {HERO_IMAGE_URL ? (
          <Image src={HERO_IMAGE_URL} alt="" fill priority className="object-cover" />
        ) : (
          <div aria-hidden className="absolute inset-0 bg-surface" />
        )}

        {/* Overlay gradient (DESIGN.md §7.2) */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,20,0.2)_0%,rgba(20,20,20,0.6)_60%,#141414_100%)]"
        />

        <Container size="full" className="relative py-24">
          <h1 className="font-display text-[48px] leading-[1.05] tracking-[-0.02em] text-text md:text-[88px]">
            NGABINTON
          </h1>

          <p className="mt-4 max-w-2xl text-xl font-semibold text-text md:text-2xl">
            Ngaji, ngobrol, badminton — dan sesekali jalan-jalan.
          </p>
          <p className="mt-3 max-w-2xl text-base text-text-secondary md:text-lg">
            Komunitas badminton mingguan yang suka kumpul, main bareng, dan kadang jalan-jalan. Yuk
            ikutan!
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/#events" className={buttonClass("primary", "lg")}>
              Lihat Event Terbaru
            </Link>
            <Link href="/tentang" className={buttonClass("ghost", "lg")}>
              Tentang Klub
            </Link>
          </div>

          <p className="mt-12 text-xs uppercase tracking-[0.04em] text-text-muted">
            {HERO_META.join(" · ")}
          </p>
        </Container>
      </section>

      <div className="space-y-24 py-24">
        <div id="events" className="scroll-mt-20">
          <EventCarousel title="Event Mendatang" events={upcoming} seeAllHref="/arsip" />
        </div>

        {archive.length > 0 ? (
          <div id="arsip" className="scroll-mt-20">
            <EventCarousel title="Arsip Lan Jalan" events={archive} seeAllHref="/arsip" />
          </div>
        ) : null}

        {/* "Momen Kami" — galeri lintas event (CONTENT.md §3.4). Pakai <ParticipantGrid />
            (grid foto 1:1); <EventMediaGallery /> versi berlightbox (COMPONENTS.md §3.8)
            belum ada di milestone mana pun. */}
        {gallery.length > 0 ? (
          <section id="galeri" className="scroll-mt-20">
            <Container size="full">
              <h2 className="text-xl font-semibold text-text md:text-2xl">Momen Kami</h2>
              <p className="mt-3 max-w-2xl text-sm text-text-muted">
                Beberapa momen dari kumpul-kumpul kami.
              </p>
              <div className="mt-6">
                <ParticipantGrid
                  columns={4}
                  images={gallery.map((item) => ({
                    url: item.url,
                    alt: item.alt ?? "Momen komunitas NGABINTON",
                  }))}
                />
              </div>
            </Container>
          </section>
        ) : null}
      </div>
    </>
  );
}
