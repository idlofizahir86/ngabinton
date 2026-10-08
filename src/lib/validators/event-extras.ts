/**
 * Validator untuk `event_extras` (SCHEMA.md §3.6). Kolom `value` bertipe `jsonb`
 * sehingga datang sebagai `unknown` — wajib diparse dengan Zod sebelum dipakai
 * (AGENTS.md §4.2: dilarang `any`).
 */
import { z } from "zod";

import type { EventExtra } from "@/lib/types/event";

/** Key `event_extras` yang dikenal (lihat `scripts/seed.ts`, CONTENT.md §4). */
export const EVENT_EXTRA_KEYS = {
  quranVerse: "quran_verse",
  narrative: "narrative",
  giftExchange: "gift_exchange",
  pickupPoints: "pickup_points",
  paymentInfo: "payment_info",
} as const;

/** `quran_verse` — CONTENT.md §4.3. */
export const quranVerseSchema = z.object({
  arabic: z.string().min(1),
  translation: z.string().min(1),
  source: z.string().min(1),
});

export type QuranVerse = z.infer<typeof quranVerseSchema>;

/** `pickup_points` — daftar titik jemput transportasi (CONTENT.md §4.6). */
export const pickupPointsSchema = z.array(z.string().min(1));

/** Nilai yang masih berisi penanda placeholder (mis. `[PLACEHOLDER: BCA / ...]`). */
const PLACEHOLDER_PATTERN = /\[placeholder/i;

const isRealValue = (value: string) => !PLACEHOLDER_PATTERN.test(value);

/**
 * `payment_info` — CONTENT.md §4.9.
 * Nilai yang masih `[PLACEHOLDER: ...]` **ditolak** supaya tidak pernah tampil ke publik
 * (parse gagal → `getEventExtra` mengembalikan `null` → kartu pembayaran tidak dirender).
 */
export const paymentInfoSchema = z.object({
  bank: z.string().min(1).refine(isRealValue),
  account_number: z.string().min(1).refine(isRealValue),
  account_name: z.string().min(1),
  deadline: z.string().min(1).optional(),
});

export type PaymentInfoExtra = z.infer<typeof paymentInfoSchema>;

/**
 * `gift_exchange` — CONTENT.md §4.10.
 * `rules` sebaiknya **tanpa** baris budget (budget ditampilkan terpisah dari
 * `budget_min`/`budget_max`) — lihat Backlog B7 di TASK.md.
 */
export const giftExchangeSchema = z.object({
  budget_min: z.number().int().nonnegative(),
  budget_max: z.number().int().nonnegative(),
  rules: z.array(z.string().min(1)),
});

export type GiftExchangeExtra = z.infer<typeof giftExchangeSchema>;

/** `narrative` — CONTENT.md §4.4. */
export const narrativeSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1),
});

export type Narrative = z.infer<typeof narrativeSchema>;

/** Semua extra yang dikenal, sudah diparse (SCHEMA.md §5.4: `jsonb` di-parse). */
export type ParsedEventExtras = {
  quranVerse: QuranVerse | null;
  narrative: Narrative | null;
  giftExchange: GiftExchangeExtra | null;
  pickupPoints: string[] | null;
  paymentInfo: PaymentInfoExtra | null;
};

/** Parse seluruh `event_extras` sekaligus supaya halaman tidak mengulang pemanggilan. */
export function parseEventExtras(extras: EventExtra[]): ParsedEventExtras {
  return {
    quranVerse: getEventExtra(extras, EVENT_EXTRA_KEYS.quranVerse, quranVerseSchema),
    narrative: getEventExtra(extras, EVENT_EXTRA_KEYS.narrative, narrativeSchema),
    giftExchange: getEventExtra(extras, EVENT_EXTRA_KEYS.giftExchange, giftExchangeSchema),
    pickupPoints: getEventExtra(extras, EVENT_EXTRA_KEYS.pickupPoints, pickupPointsSchema),
    paymentInfo: getEventExtra(extras, EVENT_EXTRA_KEYS.paymentInfo, paymentInfoSchema),
  };
}

/**
 * Ambil satu extra berdasarkan `key` lalu validasi bentuknya.
 * Mengembalikan `null` kalau extra tidak ada atau bentuknya tidak sesuai.
 */
export function getEventExtra<T>(
  extras: EventExtra[],
  key: string,
  schema: z.ZodType<T>,
): T | null {
  const extra = extras.find((item) => item.key === key);
  if (!extra) {
    return null;
  }

  const parsed = schema.safeParse(extra.value);
  return parsed.success ? parsed.data : null;
}
