import type { Metadata } from "next";

import { EventCard } from "@/components/event/event-card";
import { Container } from "@/components/layout/container";
import { getPastEvents } from "@/lib/api/events";

/** Arsip jarang berubah → di-render ulang tiap 300 detik (ROUTES.md §1.1). */
export const revalidate = 300;

/** Batas jumlah arsip yang ditampilkan (belum ada paginasi). */
const ARCHIVE_LIMIT = 100;

export const metadata: Metadata = {
  title: "Arsip Lan Jalan — NGABINTON",
  description:
    "Jejak event dan jalan-jalan komunitas badminton NGABINTON yang sudah lewat.",
};

/**
 * Halaman arsip `/arsip` — grid semua event yang sudah lewat (ROUTES.md §1.1).
 * Copy judul dari CONTENT.md §3.3; empty state dari CONTENT.md §1.4.
 */
export default async function ArsipPage() {
  const events = await getPastEvents(ARCHIVE_LIMIT);

  return (
    <div className="pb-24 pt-28">
      <Container size="full">
        <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-text md:text-[56px]">
          Arsip Lan Jalan
        </h1>
        <p className="mt-4 max-w-2xl text-base text-text-muted md:text-lg">
          Jejak jalan-jalan kami. Biar nggak lupa, semua keseruan disimpan di sini.
        </p>

        {events.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} size="fill" />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-text-muted">Belum ada event. Pantengin terus ya!</p>
        )}
      </Container>
    </div>
  );
}
