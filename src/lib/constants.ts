/**
 * Konstanta aplikasi yang **edge-safe** (tanpa dependency Node),
 * supaya bisa dipakai di `middleware.ts` maupun server biasa.
 */

/** Nama cookie session (`RULES.md` §1.2). */
export const SESSION_COOKIE_NAME = "session";

/** Durasi session: 7 hari dalam detik (`RULES.md` §1.2). */
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

/**
 * URL publik aplikasi (`.env.example` §APP, `NEXT_PUBLIC_APP_URL`).
 * Dipakai untuk metadata/OG, URL QR, dan redirect. `null` bila belum diisi.
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? null;

// ------------------------------------------------------------
// Skor & EXP permainan (RULES.md §13)
// ------------------------------------------------------------

/** EXP untuk setiap set yang dimenangkan. */
export const EXP_WIN_PER_SET = 5;

/** EXP untuk setiap set yang kalah (tetap dapat EXP saat hadir & main). */
export const EXP_LOSS_PER_SET = 2;

/** Skor maksimum satu set (rally point, contoh: 42). */
export const MAX_SET_SCORE = 42;

/** Jumlah set maksimum dalam satu game. */
export const MAX_SETS_PER_MATCH = 5;

/** Sisi tim dalam satu game. */
export const MATCH_SIDES = ["a", "b"] as const;
export type MatchSide = (typeof MATCH_SIDES)[number];

/** Suffix password default anggota club: `{username}ngabinton` (`TASK.md`). */
export const MEMBER_PASSWORD_SUFFIX = "ngabinton";

// ------------------------------------------------------------
// Polling kehadiran sesi (RULES.md §14)
// ------------------------------------------------------------

/** Pilihan RSVP. */
export const RSVP_CHOICES = ["hadir", "skip"] as const;
export type RsvpChoice = (typeof RSVP_CHOICES)[number];

/** Label tampil tiap pilihan. */
export const RSVP_LABELS: Record<RsvpChoice, string> = {
  hadir: "Gass 🔥",
  skip: "Ga dulu 🥱",
};

// ------------------------------------------------------------
// Hak akses menu area pengurus (RULES.md §5.5)
// ------------------------------------------------------------

/** Menu area `/admin` yang bisa di-assign ke user non-admin. */
export const MENU_KEYS = ["finance", "matches", "members", "events"] as const;
export type MenuKey = (typeof MENU_KEYS)[number];

/** Label menu di navigasi & halaman assign akses. */
export const MENU_LABELS: Record<MenuKey, string> = {
  finance: "Keuangan",
  matches: "Sesi & Pertandingan",
  members: "Anggota",
  events: "Event",
};

/** Penjelasan singkat tiap menu. */
export const MENU_DESCRIPTIONS: Record<MenuKey, string> = {
  finance: "Catat pemasukan/pengeluaran kas dan pantau saldo.",
  matches: "Buat sesi bermain dan catat hasil pertandingan.",
  members: "Tambah, ubah, dan nonaktifkan anggota club.",
  events: "Kelola event komunitas (travel, gathering, badminton).",
};

/** Halaman utama tiap menu — dipakai pintasan "Tugas Saya" di area anggota. */
export const MENU_HOME: Record<MenuKey, string> = {
  finance: "/admin/keuangan",
  matches: "/admin/sesi",
  members: "/admin/anggota",
  events: "/admin",
};

// ------------------------------------------------------------
// Keuangan (RULES.md §16)
// ------------------------------------------------------------

/** Kategori transaksi yang disarankan (boleh teks lain). */
export const FINANCE_CATEGORIES = {
  income: ["iuran_sesi", "kas_anggota", "donasi", "lainnya"],
  expense: ["sewa_lapangan", "shuttlecock", "konsumsi", "lainnya"],
} as const;

/** Label tampil kategori keuangan. */
export const FINANCE_CATEGORY_LABELS: Record<string, string> = {
  iuran_sesi: "Iuran Sesi",
  kas_anggota: "Kas Anggota",
  donasi: "Donasi",
  sewa_lapangan: "Sewa Lapangan",
  shuttlecock: "Shuttlecock",
  konsumsi: "Konsumsi",
  lainnya: "Lainnya",
};

/** Label jenis transaksi. */
export const FINANCE_TYPE_LABELS = {
  income: "Pemasukan",
  expense: "Pengeluaran",
} as const;

/** Metode pembayaran transaksi kas. */
export const FINANCE_PAYMENT_METHODS = ["cash", "transfer"] as const;
export type FinancePaymentMethod = (typeof FINANCE_PAYMENT_METHODS)[number];

/** Label metode pembayaran. */
export const FINANCE_PAYMENT_METHOD_LABELS: Record<FinancePaymentMethod, string> = {
  cash: "Cash",
  transfer: "Transfer Bank",
};

// ------------------------------------------------------------
// Pang-Giatna bulanan (RULES.md §13.5)
// ------------------------------------------------------------

/** Jumlah ACE Of The Month yang ditampilkan. */
export const ACE_MONTHLY_LIMIT = 3;

/** Minimal sesi agar bisa dinobatkan sebagai Pang-Tangguh Of The Month. */
export const PANG_TANGGUH_MIN_SESSIONS = 1;

/** Milestone EXP yang dianugerahkan otomatis. */
export const EXP_MILESTONES = [100, 500, 1000, 2500, 5000] as const;

/** Milestone jumlah sesi yang dianugerahkan otomatis. */
export const SESSION_MILESTONES = [10, 25, 50, 100] as const;

/** Streak ACE Of The Month berturut-turut yang dianugerahkan otomatis. */
export const ACE_STREAK_MILESTONES = [3, 6, 12] as const;

/** Jendela bulan untuk badge “rajin iuran”. */
export const DUES_DILIGENCE_WINDOW = 3;

/** Ikon lucide yang boleh dipakai badge kustom. */
export const ACHIEVEMENT_ICONS = [
  "trophy",
  "medal",
  "crown",
  "flame",
  "star",
  "zap",
  "target",
  "award",
  "shield",
  "heart",
  "wallet",
  "megaphone",
  "coins",
  "trending-up",
  "clipboard",
] as const;
export type AchievementIconKey = (typeof ACHIEVEMENT_ICONS)[number];

/** Warna badge kustom (token DESIGN.md §3.3). */
export const ACHIEVEMENT_TONES = ["primary", "live", "warning", "neutral"] as const;
export type AchievementTone = (typeof ACHIEVEMENT_TONES)[number];

/** Label tampil tone. */
export const ACHIEVEMENT_TONE_LABELS: Record<AchievementTone, string> = {
  primary: "Merah (utama)",
  live: "Hijau (live)",
  warning: "Kuning (warning)",
  neutral: "Netral",
};

/** Jumlah badge maksimal yang tampil di samping nama. */
export const MAX_VISIBLE_BADGES = 3;
