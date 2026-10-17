/**
 * Parse nilai dari `<input type="datetime-local">` sebagai waktu WIB (RULES.md §8.1).
 * Nilai tanpa offset dianggap `+07:00`.
 */
export function parseJakartaLocal(value: string): Date | null {
  if (!value) return null;
  const normalized = value.length === 16 ? `${value}:00` : value;
  const withOffset = /[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)
    ? normalized
    : `${normalized}+07:00`;
  const date = new Date(withOffset);
  return Number.isNaN(date.getTime()) ? null : date;
}
