/** Query penanggung jawab (EO) event — RULES.md §13.8. */
import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { eventOrganizers, events, users } from "@/lib/db/schema";

export type EventOption = { id: string; title: string; slug: string };

/** Semua event untuk pilihan form EO. */
export async function getEventOptions(): Promise<EventOption[]> {
  return db
    .select({ id: events.id, title: events.title, slug: events.slug })
    .from(events)
    .orderBy(desc(events.startsAt));
}

export type EventOrganizerRow = {
  id: number;
  eventId: string;
  eventTitle: string;
  userId: number;
  userName: string;
};

/** Daftar EO beserta event & anggota. */
export async function getEventOrganizers(): Promise<EventOrganizerRow[]> {
  return db
    .select({
      id: eventOrganizers.id,
      eventId: eventOrganizers.eventId,
      eventTitle: events.title,
      userId: eventOrganizers.userId,
      userName: users.displayName,
    })
    .from(eventOrganizers)
    .innerJoin(events, eq(events.id, eventOrganizers.eventId))
    .innerJoin(users, eq(users.id, eventOrganizers.userId))
    .orderBy(asc(events.title), asc(users.displayName));
}
