/**
 * Data fixture untuk dev (dipakai kalau DB kosong).
 * Sumber: CONTENT.md §4 & §6.
 *
 * Catatan: `startsAt`/`endsAt` memakai `Date` (sesuai tipe schema), bukan string.
 * `id`/timestamp di sini sintetis (hanya untuk mock).
 */
import type { Event } from "@/lib/types/event";

/** Event travel "Lan Jalan Vol. 1". */
export const lanjalanVol1: Event = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "lanjalan-vol-1",
  title: "Lan Jalan Vol. 1",
  subtitle: "Yuk Traveling — Walini Hot Spring, Ciwidey",
  description: null,
  eventType: "travel",
  theme: "storytelling",
  heroImageUrl: "/events/lanjalan-vol-1/hero-walini.jpg",
  coverImageUrl: "/events/lanjalan-vol-1/cover-travel.jpg",
  startsAt: new Date("2026-10-10T06:00:00+07:00"),
  endsAt: new Date("2026-10-10T18:00:00+07:00"),
  meetingPoint: "Vasati Rabbani",
  meetingTime: "06.00 WIB",
  returnTime: "18.00 WIB",
  location: "Walini Hot Spring, Ciwidey",
  locationUrl: "https://share.google/7MTyzAyowSQePVniK",
  transportMode: "Angkot (sewa)",
  price: 175000,
  quota: 20,
  isPublished: true,
  isFeatured: true,
  createdBy: null,
  createdAt: new Date("2026-10-01T00:00:00+07:00"),
  updatedAt: new Date("2026-10-01T00:00:00+07:00"),
};

/** Semua event fixture (saat ini 1 travel — tanpa dummy badminton). */
export const eventFixtures: Event[] = [lanjalanVol1];
