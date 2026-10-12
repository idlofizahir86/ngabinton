/**
 * Helper nama anggota untuk tampilan publik.
 * `RULES.md` §13.3: pengunjung yang belum login melihat nama disensor.
 */

/** Berapa karakter awal nama yang tetap tampil sebelum disensor. */
const VISIBLE_PREFIX = 3;

/**
 * Sensor nama untuk pengunjung (belum login): 3 karakter awal + `****`.
 * Contoh: `idlofi86` → `idl****`.
 */
export function maskName(name: string): string {
  const chars = Array.from(name.trim());
  if (chars.length <= VISIBLE_PREFIX) {
    return "****";
  }
  return `${chars.slice(0, VISIBLE_PREFIX).join("")}****`;
}

/**
 * Label tampilan anggota: pakai `nickname` (nama punggung) bila ada, else username.
 * Bila `reveal = false` (pengunjung), hasilnya disensor.
 */
export function memberLabel(
  member: { nickname: string | null; username: string },
  reveal: boolean,
): string {
  const raw = member.nickname?.trim() || member.username;
  return reveal ? raw : maskName(raw);
}
