/**
 * POST /api/mainan/pong/rooms — buat room tanding online.
 * Host boleh pengunjung; identitas login hanya dipakai untuk Riwayat Tanding.
 */
import { NextResponse } from "next/server";

import { createPongRoom } from "@/lib/api/games";
import { getCurrentUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function POST() {
  const user = await getCurrentUser();
  const name = user?.nickname?.trim() || user?.displayName || "Pengunjung";

  try {
    const room = await createPongRoom(user?.id ?? null, name);
    return NextResponse.json(
      { ok: true, code: room.code, expiresAt: room.expiresAt },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json(
      { ok: false, reason: "server" },
      { status: 500, headers: NO_STORE },
    );
  }
}
