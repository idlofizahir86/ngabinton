/**
 * Preset avatar anggota club.
 *
 * Dibatasi pada token desain (`DESIGN.md` §3) — ilustrasi 3D/clipart/sticker
 * dilarang (`AGENTS.md` §4.1). Karena itu avatar berupa **monogram** (inisial nama)
 * atau **ikon lucide** bergaya garis, dengan aksen tunggal (`primary`), `live`,
 * atau netral.
 */
export type AvatarKind = "monogram" | "icon";

/** Nama ikon lucide yang dipakai sebagai avatar. */
export type AvatarIcon =
  | "trophy"
  | "medal"
  | "award"
  | "crown"
  | "star"
  | "flame"
  | "zap"
  | "target";

export type AvatarAccent = "primary" | "live" | "neutral";

export type AvatarPreset = {
  key: string;
  label: string;
  kind: AvatarKind;
  /** Hanya untuk `kind: "icon"`. */
  icon?: AvatarIcon;
  accent: AvatarAccent;
};

export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  { key: "mono-accent", label: "Monogram Merah", kind: "monogram", accent: "primary" },
  { key: "mono-neutral", label: "Monogram Netral", kind: "monogram", accent: "neutral" },
  { key: "mono-live", label: "Monogram Hijau", kind: "monogram", accent: "live" },
  { key: "icon-trophy", label: "Trofi", kind: "icon", icon: "trophy", accent: "primary" },
  { key: "icon-medal", label: "Medali", kind: "icon", icon: "medal", accent: "neutral" },
  { key: "icon-award", label: "Penghargaan", kind: "icon", icon: "award", accent: "primary" },
  { key: "icon-crown", label: "Mahkota", kind: "icon", icon: "crown", accent: "primary" },
  { key: "icon-star", label: "Bintang", kind: "icon", icon: "star", accent: "neutral" },
  { key: "icon-flame", label: "Semangat", kind: "icon", icon: "flame", accent: "primary" },
  { key: "icon-zap", label: "Kilat", kind: "icon", icon: "zap", accent: "live" },
  { key: "icon-target", label: "Target", kind: "icon", icon: "target", accent: "neutral" },
] as const;

/** Avatar default bila anggota belum memilih. */
export const DEFAULT_AVATAR_KEY = "mono-neutral";

/** Semua key valid — dipakai validasi Zod. */
export const AVATAR_KEYS = AVATAR_PRESETS.map((preset) => preset.key);

const PRESET_BY_KEY = new Map(AVATAR_PRESETS.map((preset) => [preset.key, preset]));
const DEFAULT_PRESET = PRESET_BY_KEY.get(DEFAULT_AVATAR_KEY) as AvatarPreset;

/** Ambil preset avatar; fallback ke default kalau key tidak dikenal / kosong. */
export function getAvatarPreset(key: string | null | undefined): AvatarPreset {
  if (key) {
    const found = PRESET_BY_KEY.get(key);
    if (found) return found;
  }
  return DEFAULT_PRESET;
}

/** Inisial dari nama (maks 2 huruf). Contoh: "Tri Apr" → "TA", "도피" → "도피". */
export function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "?";
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return Array.from(words[0]).slice(0, 2).join("").toUpperCase();
  }
  const first = Array.from(words[0])[0] ?? "";
  const second = Array.from(words[1])[0] ?? "";
  return `${first}${second}`.toUpperCase();
}
