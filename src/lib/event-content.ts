/**
 * Konten & konfigurasi halaman event yang **bukan** berasal dari DB
 * (`CONTENT.md` §4). Dipisah dari halaman supaya `page.tsx` tetap ringkas
 * (AGENTS.md §3.2 no. 12: maksimum 300 baris per file).
 */

/** Label jenis event untuk metadata & header. */
export const EVENT_TYPE_LABEL: Record<string, string> = {
  badminton: "Badminton",
  travel: "Travel",
  gathering: "Kumpul",
  other: "Event",
};

export type SubNavAnchor = {
  id: string;
  label: string;
};

/**
 * Anchor sub-nav per varian (ROUTES.md §2.1).
 * Konstanta modul supaya identitas array stabil (dipakai sebagai dep `useEffect`).
 * Catatan: `#narasi` tidak terpisah di ROUTES §2.1 (digabung "Ayat & narasi")
 * tetapi ada sebagai section sendiri di CONTENT.md §4.4.
 */
export const CINEMA_ANCHORS: SubNavAnchor[] = [
  { id: "hero", label: "Awal" },
  { id: "rundown", label: "Rundown" },
  { id: "biaya", label: "Biaya" },
];

export const STORY_ANCHORS: SubNavAnchor[] = [
  { id: "hero", label: "Awal" },
  { id: "pembuka", label: "Pembuka" },
  { id: "narasi", label: "Cerita" },
  { id: "destinasi", label: "Destinasi" },
  { id: "transportasi", label: "Transportasi" },
  { id: "rundown", label: "Rundown" },
  { id: "makan", label: "Makan" },
  { id: "biaya", label: "Biaya" },
  { id: "kado", label: "Kado" },
  { id: "peserta", label: "Peserta" },
  { id: "absen", label: "Presensi" },
  { id: "penutup", label: "Penutup" },
];

/** Copy section storytelling yang belum tersimpan di `event_extras` (`CONTENT.md` §4.5–§4.12). */
export const STORY_COPY = {
  destinasi: {
    title: "Destinasi",
    name: "Walini Hot Spring",
    region: "Ciwidey, Kabupaten Bandung",
    description:
      "Pemandian air panas alami di kaki gunung, dikelilingi hutan pinus dan kebun teh. Cocok untuk berendam santai setelah perjalanan panjang naik angkot.",
    duration: "08.30 – 12.15 (≈ 3 jam 45 menit)",
    mapsUrl: "https://share.google/7MTyzAyowSQePVniK",
  },
  transportasi: {
    title: "Naik Apa?",
    description:
      "Naik angkot sewaan bareng-bareng. Titik jemput utama di Vasati Rabbani, plus beberapa titik lain di sepanjang rute. Yang penting jangan telat, nanti ditinggal!",
  },
  makan: {
    title: "Makan Siang",
    description:
      "Resto Sunda dengan view kebun teh. Menu yang kita pilih: Paket Nasi Liwet + telor + nugget.",
  },
  peserta: {
    title: "Yang Ikutan",
    description: "Beberapa muka yang bakal nongkrong di angkot.",
  },
  absen: {
    title: "Presensi",
    description: "Presensi akan dibuka saat hari H. Pantengin ya!",
  },
} as const;

/**
 * Path gambar ilustrasi narasi — konvensi aset (`ASSETS.md`).
 * `media_type` belum punya tipe `narrative` sehingga tidak bisa diambil dari
 * `event_media` (Backlog B5).
 */
export function narrativeImagePath(slug: string): string {
  return `/events/${slug}/narrative-meme.jpg`;
}
