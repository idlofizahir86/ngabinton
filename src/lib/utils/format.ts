/**
 * Format tanggal & angka versi Indonesia — `RULES.md` §6.1 & §8.
 *
 * Memakai `Intl` dengan timeZone `Asia/Jakarta` supaya output WIB tetap benar
 * walau server berjalan di UTC (mis. Vercel). Ini menyimpang dari catatan
 * `RULES.md` §8.2 (date-fns) demi tz-correctness tanpa dependency tambahan.
 */
const LOCALE = "id-ID";
const TIME_ZONE = "Asia/Jakarta";

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "Sabtu, 12 Oktober 2026" */
export function formatDate(value: Date | string | number): string {
  return dateFormatter.format(toDate(value));
}

const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "12 Okt 2026" — label ringkas untuk kartu galeri. */
export function formatDateShort(value: Date | string | number): string {
  return shortDateFormatter.format(toDate(value));
}

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "19.00" (titik sebagai pemisah, `RULES.md` §6.1) */
export function formatTime(value: Date | string | number): string {
  const parts = timeFormatter.formatToParts(toDate(value));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}.${minute}`;
}

/** "Sabtu, 12 Oktober 2026 · 19.00" */
export function formatDateTime(value: Date | string | number): string {
  return `${formatDate(value)} · ${formatTime(value)}`;
}

const numberFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

/** "Rp 175.000" (`RULES.md` §6.1) */
export function formatRupiah(amount: number): string {
  return `Rp ${numberFormatter.format(amount)}`;
}

/**
 * Format nilai untuk `<input type="datetime-local">` dalam zona WIB:
 * `YYYY-MM-DDTHH:mm` (dipakai form edit sesi).
 */
export function toDateTimeLocalWib(value: Date | string | number): string {
  const parts = timeZoneParts(toDate(value), [
    "year",
    "month",
    "day",
    "hour",
    "minute",
  ]);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function timeZoneParts(date: Date, types: string[]): Record<string, string> {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const out: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (types.includes(part.type)) out[part.type] = part.value;
  }
  return out;
}
