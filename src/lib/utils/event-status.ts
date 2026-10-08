import type { Event, EventStatus } from "@/lib/types/event";

/**
 * Status tampil event dari tanggal — `RULES.md` §2.3.
 * Catatan: belum memperhitungkan sesi presensi aktif (itu butuh data sesi,
 * dipakai di halaman event/admin, bukan di kartu landing).
 */
export function getEventStatus(
  event: Pick<Event, "startsAt" | "endsAt">,
  now: Date = new Date(),
): EventStatus {
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : start;

  if (now < start) return "upcoming";
  if (now > end) return "past";
  return "live";
}
