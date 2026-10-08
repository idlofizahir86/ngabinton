/**
 * Query baca untuk event — semua akses DB baca lewat `lib/api/`
 * (ARCHITECTURE.md §2 aturan folder 4). Referensi: SCHEMA.md §5.2.
 */
import { and, asc, eq, gt } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import { eventFixtures } from "@/lib/fixtures/events";
import type { Event } from "@/lib/types/event";

/** Batas default jumlah event yang diambil. */
const DEFAULT_LIMIT = 12;

/**
 * Event mendatang: `is_published = true` dan `starts_at` di masa depan,
 * diurutkan dari yang paling dekat.
 *
 * Fallback: kalau tabel `events` benar-benar kosong (dev belum seed),
 * kembalikan fixture agar UI tetap bisa dikembangkan.
 */
export async function getUpcomingEvents(limit: number = DEFAULT_LIMIT): Promise<Event[]> {
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.isPublished, true), gt(events.startsAt, new Date())))
    .orderBy(asc(events.startsAt))
    .limit(limit);

  if (rows.length > 0) {
    return rows;
  }

  const existing = await db.select({ id: events.id }).from(events).limit(1);
  return existing.length === 0 ? eventFixtures.slice(0, limit) : rows;
}
