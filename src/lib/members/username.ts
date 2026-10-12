/**
 * Saran username dari nama tampilan (untuk konversi BaturanNgabinton massal).
 * Non-alfanumerik dibuang; hasil kosong → `anggota`.
 */
const MAX_BASE_LENGTH = 20;
const FALLBACK = "anggota";

/** Username dasar dari nama — tanpa memeriksa ketersediaan. */
export function baseUsernameFromName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, MAX_BASE_LENGTH);
  return base.length >= 3 ? base : `${FALLBACK}${base}`;
}

/**
 * Username unik: kalau dasar sudah dipakai, tambah angka (`budi` → `budi2`).
 * `taken` harus ikut memuat username yang baru dibuat dalam batch yang sama.
 */
export function uniqueUsernameFromName(name: string, taken: ReadonlySet<string>): string {
  const base = baseUsernameFromName(name);
  if (!taken.has(base)) return base;

  let counter = 2;
  let candidate = `${base}${counter}`;
  while (taken.has(candidate)) {
    counter += 1;
    candidate = `${base}${counter}`;
  }
  return candidate;
}
