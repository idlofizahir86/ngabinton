/**
 * Katalog mini-game Pang-Jagona.
 *
 * Semua game memakai canvas vertikal 480×720 dan dimuat sebagai aset statis
 * (`public/games/*.html`) di dalam iframe supaya mesin render aslinya tidak
 * berubah. Level/kriteria kesulitan dikunci di dalam aset agar semua anggota
 * bermain pada tingkat yang sama (keputusan pemilik produk, 2026-10-21).
 */

export const GAME_SLUGS = [
  "flappy-badminton",
  "pelari-kalcer",
  "pong-ngabinton",
  "pukul-aku-pukul-aku",
] as const;

export type GameSlug = (typeof GAME_SLUGS)[number];

export type GameInfo = {
  slug: GameSlug;
  title: string;
  /** Satu kalimat untuk kartu daftar game. */
  tagline: string;
  /** Kriteria kesulitan yang dikunci. */
  level: string;
  /** Petunjuk kontrol utama (desktop & sentuh). */
  controls: string;
  asset: string;
  /** Game dengan tanding online + Riwayat Tanding. */
  online: boolean;
  /** Label metrik papan peringkat. */
  scoreLabel: string;
};

export const GAMES: readonly GameInfo[] = [
  {
    slug: "flappy-badminton",
    title: "Flappy Badminton",
    tagline:
      "Terbangkan kok melewati raket yang terus mendekat. Satu ketukan, satu kepakan.",
    level: "Tingkat termudah · Kok Ice",
    controls: "Ketuk layar (atau tekan Spasi / panah atas) untuk melompat.",
    asset: "/games/flappy-badminton.html",
    online: false,
    scoreLabel: "Raket terlewati",
  },
  {
    slug: "pelari-kalcer",
    title: "Pelari Kalcer",
    tagline:
      "Lari tanpa henti di Bandung, lompati rintangan dan serap kok emas.",
    level: "Tingkat termudah · Atlet Classic",
    controls:
      "Tombol LOMPAT (kanan bawah) dan MENUNDUK (kiri bawah), atau ketuk sisi layar. Di keyboard: Spasi / panah atas untuk lompat, panah bawah untuk menunduk.",
    asset: "/games/pelari-kalcer.html",
    online: false,
    scoreLabel: "Skor lari",
  },
  {
    slug: "pong-ngabinton",
    title: "Pong Ngabinton",
    tagline:
      "Pong badminton di stadion senja. Lawan CPU atau tantang teman lewat kode room.",
    level: "Tingkat tersulit · Raket Shadow",
    controls:
      "Geser jari di sisi lapangan untuk menggerakkan raket (atau tombol W / S). Bisa lawan CPU, 2 pemain satu perangkat, atau online.",
    asset: "/games/pong-ngabinton.html",
    online: true,
    scoreLabel: "Kemenangan online",
  },
  {
    slug: "pukul-aku-pukul-aku",
    title: "Pukul Aku, Pukul Aku",
    tagline:
      "Pukul kok yang muncul, hindari bom, kejar combo setinggi mungkin.",
    level: "Pilih karaktermu sendiri",
    controls: "Ketuk langsung kok yang muncul di layar.",
    asset: "/games/pukul-aku-pukul-aku.html",
    online: false,
    scoreLabel: "Skor",
  },
];

const GAME_SLUG_SET: ReadonlySet<string> = new Set(GAME_SLUGS);

export function isGameSlug(value: string): value is GameSlug {
  return GAME_SLUG_SET.has(value);
}

export function getGame(slug: string): GameInfo | null {
  return GAMES.find((game) => game.slug === slug) ?? null;
}

/** Batas atas skor yang masuk akal — penjaga dasar saat submit skor. */
export const GAME_SCORE_LIMITS: Record<GameSlug, number> = {
  "flappy-badminton": 10_000,
  "pelari-kalcer": 1_000_000,
  "pong-ngabinton": 0,
  "pukul-aku-pukul-aku": 100_000,
};

/** Pong dimenangkan oleh pemain pertama yang mencapai 5 poin. */
export const PONG_WIN_SCORE = 5;
