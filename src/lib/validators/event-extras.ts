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
