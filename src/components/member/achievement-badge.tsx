import {
  Award,
  CalendarCheck,
  CalendarDays,
  Clipboard,
  Coins,
  Crown,
  Flame,
  Gem,
  Heart,
  Medal,
  Megaphone,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Achievement } from "@/lib/api/achievements";
import { getAchievementVisual } from "@/lib/achievements/visuals";
import { MAX_VISIBLE_BADGES, type AchievementTone } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
  flame: Flame,
  star: Star,
  zap: Zap,
  target: Target,
  award: Award,
  shield: Shield,
  heart: Heart,
  sparkles: Sparkles,
  rocket: Rocket,
  gem: Gem,
  "calendar-check": CalendarCheck,
  "calendar-days": CalendarDays,
  wallet: Wallet,
  megaphone: Megaphone,
  coins: Coins,
  "trending-up": TrendingUp,
  clipboard: Clipboard,
};

const TONE_CLASSES: Record<AchievementTone, string> = {
  primary: "border-primary/50 bg-primary/10 text-primary",
  live: "border-live/50 bg-live/10 text-live",
  warning: "border-warning/50 bg-warning/10 text-warning",
  neutral: "border-border-strong bg-surface-hover text-text-secondary",
};

function tooltipFor(achievement: Achievement): string {
  const visual = getAchievementVisual(achievement);
  return achievement.description
    ? `${visual.fullLabel} — ${achievement.description}`
    : visual.fullLabel;
}

/** Badge ringkas (ikon saja, unik per pencapaian) di samping nama. */
export function AchievementBadge({
  achievement,
  className,
}: {
  achievement: Achievement;
  className?: string;
}) {
  const visual = getAchievementVisual(achievement);
  const Icon = ICONS[visual.iconKey] ?? Award;

  return (
    <span
      title={tooltipFor(achievement)}
      className={cn(
        "inline-flex h-6 shrink-0 items-center justify-center gap-1 rounded-pill border",
        visual.periodCode ? "px-1.5" : "w-6",
        TONE_CLASSES[visual.tone],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {visual.periodCode ? (
        <span className="font-mono text-[9px] font-semibold leading-none">
          {visual.periodCode}
        </span>
      ) : null}
      <span className="sr-only">
        {visual.fullLabel}
        {visual.periodCode ? ` · ${visual.periodCode}` : ""}
      </span>
    </span>
  );
}

/** Badge lengkap (ikon + label) untuk kartu pencapaian. */
export function AchievementBadgeFull({
  achievement,
  className,
}: {
  achievement: Achievement;
  className?: string;
}) {
  const visual = getAchievementVisual(achievement);
  const Icon = ICONS[visual.iconKey] ?? Award;

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-pill border px-3 py-1 text-xs font-semibold",
        TONE_CLASSES[visual.tone],
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="truncate">{visual.fullLabel}</span>
    </span>
  );
}

/** Urutkan dari pencapaian terbaru, lalu ambil sejumlah `max`. */
export function topAchievements(list: Achievement[], max = MAX_VISIBLE_BADGES): Achievement[] {
  return [...list]
    .sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime())
    .slice(0, max);
}

/** Deretan badge ikon (maks 3) + penanda `+N` bila masih ada sisanya. */
export function AchievementBadges({
  achievements,
  max = MAX_VISIBLE_BADGES,
}: {
  achievements: Achievement[];
  max?: number;
}) {
  const shown = topAchievements(achievements, max);
  const rest = achievements.length - shown.length;

  return (
    <>
      {shown.map((achievement) => (
        <AchievementBadge key={achievement.id} achievement={achievement} />
      ))}
      {rest > 0 ? (
        <span
          title={`${rest} pencapaian lainnya`}
          className="inline-flex h-6 items-center rounded-pill border border-border bg-surface-hover px-1.5 text-[10px] font-semibold text-text-muted"
        >
          +{rest}
        </span>
      ) : null}
    </>
  );
}
