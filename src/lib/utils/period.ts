/**
 * Periode bulanan berbasis WIB (Asia/Jakarta) untuk Pang-Giatna & keuangan.
 * `periodKey` berformat `YYYY-MM`.
 */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export type Period = {
  key: string;
  start: Date;
  /** Eksklusif — awal bulan berikutnya. */
  end: Date;
  label: string;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** `YYYY-MM` dari sebuah tanggal menurut WIB. */
export function getPeriodKey(value: Date = new Date()): string {
  const shifted = new Date(value.getTime() + WIB_OFFSET_MS);
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}`;
}

/** Rentang & label dari sebuah `periodKey`. */
export function getPeriod(key: string = getPeriodKey()): Period {
  const [yearRaw, monthRaw] = key.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return getPeriod(getPeriodKey());
  }

  const start = new Date(Date.UTC(year, month - 1, 1) - WIB_OFFSET_MS);
  const end = new Date(Date.UTC(year, month, 1) - WIB_OFFSET_MS);

  return { key, start, end, label: `${MONTH_NAMES[month - 1]} ${year}` };
}

/** Bulan berjalan (WIB). */
export function currentPeriod(): Period {
  return getPeriod(getPeriodKey());
}

/** Bulan sebelumnya (WIB) — dipakai tampilan ACE saat bulan baru belum ada game. */
export function previousPeriod(): Period {
  const [yearRaw, monthRaw] = getPeriodKey().split("-");
  const date = new Date(Date.UTC(Number(yearRaw), Number(monthRaw) - 2, 1));
  return getPeriod(`${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`);
}

/** Geser `periodKey` sebanyak `delta` bulan. */
export function shiftPeriod(key: string, delta: number): string {
  const [yearRaw, monthRaw] = key.split("-");
  const date = new Date(Date.UTC(Number(yearRaw), Number(monthRaw) - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** Label pendek untuk badge: `Okt 2026`. */
export function shortPeriodLabel(key: string): string {
  const [yearRaw, monthRaw] = key.split("-");
  const month = Number(monthRaw);
  if (!Number.isInteger(month) || month < 1 || month > 12) return key;
  return `${SHORT_MONTHS[month - 1]} ${yearRaw}`;
}

/** Validasi `YYYY-MM`. */
export function isValidPeriodKey(value: string | null | undefined): value is string {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export type PeriodOption = { value: string; label: string };

/** Opsi filter bulan dari sekumpulan tanggal (terbaru dulu). */
export function periodOptionsFromDates(dates: Date[]): PeriodOption[] {
  const keys = [...new Set(dates.map((date) => getPeriodKey(date)))].sort((a, b) =>
    b.localeCompare(a),
  );
  return keys.map((key) => ({ value: key, label: getPeriod(key).label }));
}

/** Apakah `periodKey` adalah bulan berjalan. */
export function isCurrentPeriod(key: string): boolean {
  return key === getPeriodKey();
}
