import { Award, Crown, Flame, Medal, Star, Target, Trophy, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

import {
  getAvatarPreset,
  getInitials,
  type AvatarAccent,
  type AvatarIcon,
} from "@/lib/members/avatars";
import { cn } from "@/lib/utils/cn";

const ICONS: Record<AvatarIcon, LucideIcon> = {
  trophy: Trophy,
  medal: Medal,
  award: Award,
  crown: Crown,
  star: Star,
  flame: Flame,
  zap: Zap,
  target: Target,
};

const ACCENT_CLASSES: Record<AvatarAccent, string> = {
  primary: "bg-primary/15 text-primary ring-primary/40",
  live: "bg-live/15 text-live ring-live/40",
  neutral: "bg-surface-hover text-text ring-border",
};

const SIZE_CLASSES = {
  sm: { box: "h-8 w-8", px: 32, icon: "h-4 w-4", text: "text-xs" },
  md: { box: "h-11 w-11", px: 44, icon: "h-5 w-5", text: "text-sm" },
  lg: { box: "h-16 w-16", px: 64, icon: "h-7 w-7", text: "text-xl" },
} as const;

export type MemberAvatarSize = keyof typeof SIZE_CLASSES;

export type MemberAvatarProps = {
  name: string;
  avatarKey?: string | null;
  /** Foto upload anggota; dipakai bila ada (menimpa preset). */
  avatarUrl?: string | null;
  size?: MemberAvatarSize;
  className?: string;
};

/**
 * Avatar anggota: foto upload bila ada, else monogram/ikon preset
 * (COMPONENTS.md §7.1). Dibatasi token desain — tanpa ilustrasi/clipart.
 */
export function MemberAvatar({
  name,
  avatarKey,
  avatarUrl,
  size = "md",
  className,
}: MemberAvatarProps) {
  const dims = SIZE_CLASSES[size];

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        aria-hidden
        width={dims.px}
        height={dims.px}
        className={cn("shrink-0 rounded-pill object-cover ring-1 ring-border", dims.box, className)}
      />
    );
  }

  const preset = getAvatarPreset(avatarKey);
  const Icon = preset.icon ? ICONS[preset.icon] : null;

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-pill font-semibold ring-1",
        ACCENT_CLASSES[preset.accent],
        dims.box,
        dims.text,
        className,
      )}
    >
      {Icon ? <Icon className={dims.icon} strokeWidth={2} /> : <span>{getInitials(name)}</span>}
    </span>
  );
}
