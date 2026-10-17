import { AchievementBadgeFull } from "@/components/member/achievement-badge";
import type { Achievement } from "@/lib/api/achievements";
import { formatDate } from "@/lib/utils/format";

/** Daftar pencapaian anggota (RULES.md §13.6). */
export function AchievementList({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
        Belum ada badge. Badge didapat dari ACE, Pang-Tangguh, milestone EXP/sesi, dan kemenangan
        pertama.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {achievements.map((achievement) => (
        <li key={achievement.id} className="rounded-lg border border-border bg-surface p-4">
          <AchievementBadgeFull achievement={achievement} />
          <p className="mt-2 text-sm text-text-secondary">
            {achievement.description ?? achievement.label}
          </p>
          <p className="mt-1 text-xs text-text-subtle">
            Diraih {formatDate(achievement.awardedAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
