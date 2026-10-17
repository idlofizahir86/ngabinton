import { RacketArt, ShuttlecockArt } from "@/components/member/badminton-art";
import { AchievementBadges } from "@/components/member/achievement-badge";
import { MemberAvatar } from "@/components/member/member-avatar";
import { BrandLogo } from "@/components/layout/brand-logo";
import type { Achievement } from "@/lib/api/achievements";
import { maskName } from "@/lib/members/name";

export type MemberCardData = {
  displayName: string;
  nickname: string | null;
  username: string;
  avatarKey: string | null;
  avatarUrl: string | null;
  exp: number;
  rank: number;
  sessions: number;
  games: number;
  achievements: Achievement[];
};

export type MemberCardProps = {
  member: MemberCardData;
  /** `false` untuk pengunjung: nama & username disensor. */
  reveal?: boolean;
};

/** Ngabinton Member Card — kartu identitas anggota (COMPONENTS.md §7.24). */
export function MemberCard({ member, reveal = true }: MemberCardProps) {
  const rawName = member.nickname || member.displayName;
  const name = reveal ? rawName : maskName(rawName);
  const username = reveal ? member.username : maskName(member.username);

  return (
    <article className="relative overflow-hidden rounded-xl border border-border bg-background-elevated shadow-elevated">
      <div className="h-1.5 bg-primary" />

      <RacketArt className="pointer-events-none absolute -right-14 -top-10 h-72 w-52 rotate-12 text-primary/15" />
      <ShuttlecockArt className="pointer-events-none absolute -bottom-10 -left-8 h-44 w-36 -rotate-12 text-primary/20" />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <BrandLogo decorative className="h-6 w-auto" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-text-subtle">Member Card</p>
            <p className="mt-0.5 font-mono text-[10px] text-text-subtle">
              NGT-{member.username.toUpperCase().slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="rounded-pill p-0.5 ring-2 ring-primary/60">
              <MemberAvatar
                name={rawName}
                avatarKey={member.avatarKey}
                avatarUrl={member.avatarUrl}
                size="lg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-2xl leading-tight text-text md:text-3xl">
                {name}
              </p>
              <p className="truncate text-sm text-text-muted">@{username}</p>
              <p className="mt-1 inline-flex items-center rounded-pill border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
                Peringkat #{member.rank}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-display text-3xl leading-none tabular-nums text-primary md:text-4xl">
              {member.exp}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-text-muted">Total EXP</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-border border-y border-border py-3 text-center">
          <Stat label="Sesi" value={member.sessions} />
          <Stat label="Game" value={member.games} />
          <Stat label="Rata-rata" value={perGame(member.exp, member.games)} />
        </div>

        <div className="mt-4 flex min-h-5 flex-wrap gap-1.5">
          {member.achievements.length > 0 ? (
            <AchievementBadges achievements={member.achievements} />
          ) : (
            <p className="text-xs text-text-subtle">Belum ada badge — main terus untuk dapat!</p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[9px] uppercase tracking-[0.2em] text-text-subtle">
            Ngabinton · Komunitas Badminton Mingguan
          </p>
          <ShuttlecockArt className="h-6 w-5 shrink-0 text-primary/70" />
        </div>
      </div>
    </article>
  );
}

function perGame(exp: number, games: number): string {
  if (games === 0) return "—";
  return `${Math.round((exp / games) * 10) / 10}`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-2">
      <p className="font-display text-xl tabular-nums text-text">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.06em] text-text-muted">{label}</p>
    </div>
  );
}
