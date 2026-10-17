/**
 * Identitas visual setiap pencapaian (RULES.md §13.6).
 * Ikon unik per jenis/level + label lengkap & ringkas.
 */
import type { AchievementTone } from "@/lib/constants";

export type AchievementType =
  | "ace_of_month"
  | "pang_tangguh_of_month"
  | "exp_milestone"
  | "sessions_milestone"
  | "first_win"
  | "custom"
  | "ace_streak"
  | "dues_diligent"
  | "role"
  | "family_join";

export type AchievementLike = {
  type: AchievementType;
  code: string;
  label: string;
  description?: string | null;
  periodKey: string;
  icon?: string | null;
  tone?: string | null;
};

export type AchievementVisual = {
  iconKey: string;
  tone: AchievementTone;
  /** Label lengkap untuk tooltip/kartu. */
  fullLabel: string;
  /** Label super pendek untuk ruang sempit. */
  shortLabel: string;
  /** Kode bulan ringkas untuk badge bulanan, mis. `OKT26`. */
  periodCode: string | null;
};

const TONES: AchievementTone[] = ["primary", "live", "warning", "neutral"];

function safeTone(value: string | null | undefined): AchievementTone | null {
  if (!value) return null;
  return TONES.find((tone) => tone === value) ?? null;
}

const CODE_VISUALS: Record<string, { iconKey: string; tone: AchievementTone }> = {
  ace_of_month: { iconKey: "crown", tone: "warning" },
  pang_tangguh_of_month: { iconKey: "flame", tone: "live" },
  first_win: { iconKey: "trophy", tone: "warning" },
  exp_100: { iconKey: "star", tone: "primary" },
  exp_500: { iconKey: "sparkles", tone: "primary" },
  exp_1000: { iconKey: "zap", tone: "primary" },
  exp_2500: { iconKey: "rocket", tone: "warning" },
  exp_5000: { iconKey: "gem", tone: "warning" },
  sessions_10: { iconKey: "calendar-check", tone: "neutral" },
  sessions_25: { iconKey: "calendar-days", tone: "neutral" },
  sessions_50: { iconKey: "medal", tone: "neutral" },
  sessions_100: { iconKey: "award", tone: "neutral" },
  ace_streak_3: { iconKey: "trending-up", tone: "warning" },
  ace_streak_6: { iconKey: "flame", tone: "warning" },
  ace_streak_12: { iconKey: "crown", tone: "warning" },
  dues_diligent_3m: { iconKey: "coins", tone: "live" },
  role_finance_steward: { iconKey: "wallet", tone: "live" },
  family_join: { iconKey: "home", tone: "live" },
};

const TYPE_FALLBACK: Record<AchievementType, { iconKey: string; tone: AchievementTone }> = {
  ace_of_month: { iconKey: "crown", tone: "warning" },
  pang_tangguh_of_month: { iconKey: "flame", tone: "live" },
  exp_milestone: { iconKey: "zap", tone: "primary" },
  sessions_milestone: { iconKey: "calendar-check", tone: "neutral" },
  first_win: { iconKey: "trophy", tone: "warning" },
  custom: { iconKey: "award", tone: "primary" },
  ace_streak: { iconKey: "trending-up", tone: "warning" },
  dues_diligent: { iconKey: "coins", tone: "live" },
  role: { iconKey: "award", tone: "primary" },
  family_join: { iconKey: "home", tone: "live" },
};

/** `OKT26` dari `2026-10`. */
function periodCode(periodKey: string): string | null {
  if (periodKey === "all") return null;
  const [year, month] = periodKey.split("-");
  const names = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
  const index = Number(month) - 1;
  if (!names[index]) return null;
  return `${names[index]}${year.slice(2)}`;
}

/** Visual final: snapshot definisi kustom menang atas mapping jenis. */
export function getAchievementVisual(achievement: AchievementLike): AchievementVisual {
  const isEventOrganizer = achievement.code.startsWith("role_eo_");
  const base = isEventOrganizer
    ? { iconKey: "megaphone", tone: "warning" as AchievementTone }
    : (CODE_VISUALS[achievement.code] ?? TYPE_FALLBACK[achievement.type]);

  const streakMatch = /^ace_streak_(\d+)$/.exec(achievement.code);

  return {
    iconKey: achievement.icon ?? base.iconKey,
    tone: safeTone(achievement.tone) ?? base.tone,
    fullLabel: achievement.label,
    shortLabel:
      achievement.type === "ace_of_month"
        ? "ACE"
        : achievement.type === "pang_tangguh_of_month"
          ? "TGH"
          : achievement.type === "first_win"
            ? "WIN"
            : achievement.code === "role_finance_steward"
              ? "DUIT"
              : achievement.code === "family_join"
                ? "KLRG"
                : isEventOrganizer
                ? "EO"
                : streakMatch
                  ? `${streakMatch[1]}X`
                  : achievement.label,
    periodCode: periodCode(achievement.periodKey),
  };
}
