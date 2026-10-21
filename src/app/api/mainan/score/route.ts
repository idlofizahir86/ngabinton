/**
 * POST /api/mainan/score — simpan skor mini-game ke Pang-Jagona.
 * Hanya untuk pengguna yang login; pengunjung tetap boleh bermain.
 */
import { NextResponse } from "next/server";

import { addGameScore } from "@/lib/api/games";
import { getCurrentUser } from "@/lib/auth/guards";
import { checkGameScoreRateLimit } from "@/lib/auth/rate-limit";
import { GAME_SCORE_LIMITS, isGameSlug } from "@/lib/games/catalog";
import { gameScoreSchema } from "@/lib/validators/game";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: "guest" }, { headers: NO_STORE });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = gameScoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { headers: NO_STORE });
  }

  const game = parsed.data.game;
  if (!isGameSlug(game)) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { headers: NO_STORE });
  }

  const limit = GAME_SCORE_LIMITS[game];
  if (limit <= 0 || parsed.data.score > limit) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { headers: NO_STORE });
  }

  const rate = await checkGameScoreRateLimit(user.id);
  if (!rate.success) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { headers: NO_STORE });
  }

  await addGameScore(game, user.id, parsed.data.score);
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
