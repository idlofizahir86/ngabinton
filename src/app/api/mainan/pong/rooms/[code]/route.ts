/**
 * Room Pong online:
 * - GET   → status room + SDP (dipakai polling WebRTC).
 * - POST  → `{ action: "join" }` isi kursi tamu.
 * - PATCH → `{ offer }` dari host atau `{ answer }` dari tamu.
 */
import { NextResponse } from "next/server";

import { clearPongAnswer, getPongRoom, joinPongRoom, setPongAnswer, setPongOffer } from "@/lib/api/games";
import { getCurrentUser } from "@/lib/auth/guards";
import { pongJoinSchema, pongSignalSchema } from "@/lib/validators/game";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };
const CODE_PATTERN = /^[A-Z0-9]{4,12}$/;

type RouteContext = { params: Promise<{ code: string }> };

async function resolveCode(context: RouteContext): Promise<string | null> {
  const { code } = await context.params;
  const normalized = code.toUpperCase();
  return CODE_PATTERN.test(normalized) ? normalized : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const code = await resolveCode(context);
  if (!code) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400, headers: NO_STORE });
  }

  const room = await getPongRoom(code);
  if (!room) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404, headers: NO_STORE });
  }

  return NextResponse.json(
    {
      ok: true,
      code: room.code,
      status: room.status,
      hostName: room.hostName,
      guestName: room.guestName,
      hostOffer: room.hostOffer,
      guestAnswer: room.guestAnswer,
    },
    { headers: NO_STORE },
  );
}

export async function POST(request: Request, context: RouteContext) {
  const code = await resolveCode(context);
  if (!code) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400, headers: NO_STORE });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!pongJoinSchema.safeParse(body).success) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400, headers: NO_STORE });
  }

  const user = await getCurrentUser();
  const guestName = user?.nickname?.trim() || user?.displayName || "Pengunjung";
  const room = await joinPongRoom(code, user?.id ?? null, guestName);
  if (!room) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404, headers: NO_STORE });
  }

  return NextResponse.json({ ok: true, code: room.code }, { headers: NO_STORE });
}

export async function PATCH(request: Request, context: RouteContext) {
  const code = await resolveCode(context);
  if (!code) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400, headers: NO_STORE });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = pongSignalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400, headers: NO_STORE });
  }

  const room = await getPongRoom(code);
  if (!room) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404, headers: NO_STORE });
  }

  if (parsed.data.offer) {
    await setPongOffer(code, parsed.data.offer);
    if (parsed.data.reset) await clearPongAnswer(code);
  } else if (parsed.data.answer) {
    await setPongAnswer(code, parsed.data.answer);
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
