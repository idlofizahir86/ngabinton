/**
 * POST /api/mainan/pong/result — catat hasil tanding online.
 * Dipanggil host setelah salah satu pemain mencapai 5 poin.
 */
import { NextResponse } from "next/server";

import { recordPongMatch } from "@/lib/api/games";
import { pongResultSchema } from "@/lib/validators/game";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = pongResultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400, headers: NO_STORE });
  }

  const saved = await recordPongMatch(
    parsed.data.code,
    parsed.data.hostScore,
    parsed.data.guestScore,
  );

  return NextResponse.json({ ok: saved }, { headers: NO_STORE });
}
