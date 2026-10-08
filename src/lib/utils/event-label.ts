/**
 * Label turunan dari judul event (volume) — tidak ada kolom khusus di schema
 * (`SCHEMA.md` §3.2), jadi diekstrak dari judul. Dipakai `<EventCard />` & `<EventHero />`.
 */
export function getVolumeLabel(title: string): string | null {
  const match = title.match(/vol\.?\s*(\d+)/i);
  return match ? `Vol. ${match[1]}` : null;
}
