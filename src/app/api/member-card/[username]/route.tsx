import { ImageResponse } from "next/og";

import type { Achievement } from "@/lib/api/achievements";
import { getAchievementsForUser } from "@/lib/api/achievements";
import { getMemberByUsername, getMemberStats } from "@/lib/api/members";
import { getStandings, rankFromStandings } from "@/lib/api/rankings";
import { getAchievementVisual } from "@/lib/achievements/visuals";
import { getCurrentUser } from "@/lib/auth/guards";
import type { AchievementTone } from "@/lib/constants";
import { getInitials } from "@/lib/members/avatars";
import { maskName } from "@/lib/members/name";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = { params: Promise<{ username: string }> };

function initialsFor(name: string): string {
  return getInitials(name).toUpperCase();
}

/** Unduh Ngabinton Member Card sebagai PNG 1200×630 (tanpa dependency tambahan). */
export async function GET(_request: Request, { params }: RouteProps) {
  const { username } = await params;

  const member = await getMemberByUsername(username);
  if (!member) {
    return new Response("Anggota tidak ditemukan.", { status: 404 });
  }

  const [viewer, stats, standings, achievements] = await Promise.all([
    getCurrentUser(),
    getMemberStats(member.id),
    getStandings(),
    getAchievementsForUser(member.id),
  ]);

  const rank = rankFromStandings(standings, member.id);
  const reveal = Boolean(viewer);
  const rawName = member.nickname || member.displayName;
  const name = reveal ? rawName : maskName(rawName);
  const handle = reveal ? member.username : maskName(member.username);
  const sessions = standings.find((row) => row.userId === member.id)?.stats.sessions ?? 0;
  const sortedBadges = [...achievements].sort(
    (a, b) => b.awardedAt.getTime() - a.awardedAt.getTime(),
  );
  const shownBadges = sortedBadges.slice(0, 3);
  const restBadges = sortedBadges.length - shownBadges.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#141414",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: 60,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: "#e50914",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -120,
            top: -70,
            width: 420,
            height: 420,
            display: "flex",
            transform: "rotate(18deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 70,
              top: 0,
              width: 260,
              height: 320,
              border: "12px solid rgba(229,9,20,0.16)",
              borderRadius: 999,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 194,
              top: 310,
              width: 12,
              height: 190,
              background: "rgba(229,9,20,0.16)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 160,
              top: 488,
              width: 78,
              height: 14,
              background: "rgba(229,9,20,0.16)",
              transform: "rotate(34deg)",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: -40,
            bottom: -40,
            width: 300,
            height: 280,
            display: "flex",
            transform: "rotate(-18deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 110,
              top: 0,
              width: 10,
              height: 150,
              background: "rgba(229,9,20,0.14)",
              transform: "rotate(-24deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 140,
              top: -6,
              width: 10,
              height: 160,
              background: "rgba(229,9,20,0.14)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 170,
              top: 0,
              width: 10,
              height: 150,
              background: "rgba(229,9,20,0.14)",
              transform: "rotate(24deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 94,
              top: 128,
              width: 96,
              height: 96,
              borderRadius: 999,
              background: "rgba(229,9,20,0.2)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", fontSize: 36, fontWeight: 900, letterSpacing: 7 }}>
            NGABINTON
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div
              style={{
                display: "flex",
                fontSize: 16,
                letterSpacing: 8,
                color: "#808080",
                textTransform: "uppercase",
              }}
            >
              Member Card
            </div>
            <div style={{ display: "flex", fontSize: 13, letterSpacing: 3, color: "#5f5f5f" }}>
              NGT-{member.username.toUpperCase().slice(0, 8)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 40,
            marginTop: 58,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div
              style={{
                width: 168,
                height: 168,
                borderRadius: 999,
                border: "4px solid rgba(229,9,20,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
              }}
            >
              <div
                style={{
                  width: 144,
                  height: 144,
                  borderRadius: 999,
                  background: "#e50914",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 58,
                  fontWeight: 800,
                }}
              >
                {initialsFor(rawName)}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 62, fontWeight: 800, lineHeight: 1.02 }}>
                {name}
              </div>
              <div style={{ display: "flex", fontSize: 26, color: "#b3b3b3", marginTop: 8 }}>
                @{handle}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 17,
                  color: "#e50914",
                  marginTop: 12,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                Peringkat #{rank} · Pang-Giatna Ngabinton
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "#e50914" }}>
              {member.exp}
            </div>
            <div style={{ display: "flex", fontSize: 14, letterSpacing: 4, color: "#808080" }}>
              TOTAL EXP
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 0,
            marginTop: "auto",
            borderTop: "1px solid #404040",
            borderBottom: "1px solid #404040",
            padding: "24px 0",
            position: "relative",
          }}
        >
          <Stat label="SESI" value={sessions} />
          <Stat label="GAME" value={stats.games} />
          <Stat label="SET MENANG" value={`${stats.setsWon}/${stats.setsPlayed}`} />
          <Stat
            label="RATA-RATA EXP"
            value={stats.games > 0 ? Math.round((member.exp / stats.games) * 10) / 10 : "—"}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            marginTop: 24,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 840 }}>
            {shownBadges.length > 0 ? (
              shownBadges.map((achievement) => (
                <CardBadge key={achievement.id} achievement={achievement} />
              ))
            ) : (
              <div style={{ display: "flex", fontSize: 16, color: "#808080" }}>
                Belum ada badge — main terus untuk dapat!
              </div>
            )}
            {restBadges > 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid #404040",
                  background: "#232323",
                  color: "#b3b3b3",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                +{restBadges}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", fontSize: 12, letterSpacing: 4, color: "#5f5f5f" }}>
            NGABINTON · BADMINTON MINGGUAN
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

/** Path SVG sederhana agar ikon tetap tampil di PNG (satori tidak merender komponen lucide). */
const ICON_PATHS: Record<string, string> = {
  trophy:
    '<path d="M8 3h8v4a4 4 0 0 1-8 0V3Z"/><path d="M6 5H4v2a3 3 0 0 0 3 3"/><path d="M18 5h2v2a3 3 0 0 1-3 3"/><path d="M12 11v5"/><path d="M8 21h8"/><path d="M10 16h4v5h-4z"/>',
  medal:
    '<circle cx="12" cy="9" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/>',
  crown: '<path d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7Z"/>',
  flame:
    '<path d="M12 2c2 4 6 6 6 11a6 6 0 1 1-12 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4 1-7 2-10Z"/>',
  star: '<polygon points="12 2 15 9 22 9.5 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9.5 9 9"/>',
  zap: '<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8Z"/>',
  target:
    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  award:
    '<circle cx="12" cy="9" r="5"/><path d="M8 14l-2 7 6-3 6 3-2-7"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z"/>',
  heart:
    '<path d="M12 21s-8-5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11Z"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  sparkles:
    '<path d="M12 3l1.5 4L18 8.5 13.5 10 12 14l-1.5-4L6 8.5 10.5 7 12 3Z"/><path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z"/>',
  rocket:
    '<path d="M9 15l-3-3c1-6 5-9 12-10-1 7-4 11-10 12Z"/><path d="M5 14c-1 3 0 5 0 5s2 1 5 0"/><circle cx="15" cy="8" r="1.5"/>',
  gem: '<path d="M6 3h12l3 6-9 12L3 9l3-6Z"/><path d="M3 9h18"/><path d="M9 3l3 6 3-6"/>',
  "calendar-check":
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M9 15l2 2 4-4"/>',
  "calendar-days":
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><circle cx="8" cy="14" r="1"/><circle cx="12" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',
  wallet:
    '<path d="M3 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/><path d="M3 6l12-3v3"/><path d="M16 13h4"/>',
  megaphone:
    '<path d="M4 10v4l12 5V5L4 10Z"/><path d="M16 8a3 3 0 0 1 0 8"/><path d="M7 15l1 5"/>',
  coins: '<circle cx="9" cy="9" r="5"/><circle cx="15" cy="15" r="5"/>',
  "trending-up": '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  clipboard:
    '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/>',
};

function iconDataUri(iconKey: string, color: string): string {
  const inner = ICON_PATHS[iconKey] ?? ICON_PATHS.award;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const TONE_HEX: Record<AchievementTone, { fg: string; bg: string; border: string }> = {
  primary: { fg: "#ff4d55", bg: "rgba(229,9,20,0.14)", border: "rgba(229,9,20,0.5)" },
  live: { fg: "#4ade80", bg: "rgba(34,197,94,0.14)", border: "rgba(34,197,94,0.5)" },
  warning: { fg: "#fbbf24", bg: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.5)" },
  neutral: { fg: "#d4d4d4", bg: "#232323", border: "#606060" },
};

function CardBadge({ achievement }: { achievement: Achievement }) {
  const visual = getAchievementVisual(achievement);
  const tone = TONE_HEX[visual.tone];
  const text = visual.periodCode ?? visual.shortLabel;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 999,
        border: `1px solid ${tone.border}`,
        background: tone.bg,
        color: tone.fg,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse/satori hanya mendukung <img> */}
      <img
        src={iconDataUri(visual.iconKey, tone.fg)}
        width={20}
        height={20}
        alt=""
        style={{ width: 20, height: 20 }}
      />
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 1,
          maxWidth: 170,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", fontSize: 16, color: "#808080", letterSpacing: 3 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 46,
          fontWeight: 800,
          color: accent ? "#e50914" : "#ffffff",
          marginTop: 4,
        }}
      >
        {String(value)}
      </div>
    </div>
  );
}
