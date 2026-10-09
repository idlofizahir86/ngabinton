/**
 * Query baca untuk event — semua akses DB baca lewat `lib/api/`
 * (ARCHITECTURE.md §2 aturan folder 4). Referensi: SCHEMA.md §5.2.
 */
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  attendanceSessions,
  budgetItems,
  eventMedia,
  events,
  rundownItems,
} from "@/lib/db/schema";
import { eventFixtures } from "@/lib/fixtures/events";
import type { Event } from "@/lib/types/event";

/** Batas default jumlah event yang diambil. */
const DEFAULT_LIMIT = 12;

/** Batas default jumlah foto galeri landing. */
const GALLERY_LIMIT = 8;

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

/**
 * Arsip travel: `event_type = 'travel'`, published, dan `starts_at` sudah lewat,
 * diurutkan dari yang paling baru.
 *
 * Catatan: **tanpa** fallback fixture (fixture bukan event masa lalu) —
 * kalau kosong, section arsip disembunyikan (CONTENT.md §3.3).
 */
export async function getPastTravelEvents(limit: number = DEFAULT_LIMIT): Promise<Event[]> {
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.isPublished, true),
        eq(events.eventType, "travel"),
        lt(events.startsAt, new Date()),
      ),
    )
    .orderBy(desc(events.startsAt))
    .limit(limit);
}

/**
 * Arsip semua jenis event: published dan `starts_at` sudah lewat,
 * diurutkan dari yang paling baru — dipakai halaman `/arsip` (ROUTES.md §1.1).
 */
export async function getPastEvents(limit: number = DEFAULT_LIMIT): Promise<Event[]> {
  return db
    .select()
    .from(events)
    .where(and(eq(events.isPublished, true), lt(events.startsAt, new Date())))
    .orderBy(desc(events.startsAt))
    .limit(limit);
}

/**
 * Foto galeri (`type = 'gallery'`) untuk section "Momen Kami" di landing.
 * Lintas event; urut `order` di dalam event terbaru (CONTENT.md §3.4).
 */
export async function getGalleryMedia(limit: number = GALLERY_LIMIT) {
  return db
    .select({ id: eventMedia.id, url: eventMedia.url, alt: eventMedia.alt })
    .from(eventMedia)
    .where(eq(eventMedia.type, "gallery"))
    .orderBy(desc(eventMedia.createdAt), asc(eventMedia.order))
    .limit(limit);
}

/** Bentuk satu item galeri hasil `getGalleryMedia`. */
export type GalleryMedia = Awaited<ReturnType<typeof getGalleryMedia>>[number];

/**
 * Event publik berdasarkan slug + relasi lengkap (SCHEMA.md §5.1).
 * Hanya event `is_published = true`; kalau tidak ada → `null`.
 * Sesi yang diambil hanya yang `is_active = true` (maks 1).
 */
export async function getEventBySlug(slug: string) {
  const event = await db.query.events.findFirst({
    where: and(eq(events.slug, slug), eq(events.isPublished, true)),
    with: {
      rundownItems: { orderBy: [asc(rundownItems.order)] },
      budgetItems: { orderBy: [asc(budgetItems.order)] },
      media: { orderBy: [asc(eventMedia.order)] },
      extras: true,
      sessions: { where: eq(attendanceSessions.isActive, true), limit: 1 },
    },
  });

  return event ?? null;
}

/** Bentuk lengkap event (dengan relasi) hasil `getEventBySlug`. */
export type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
