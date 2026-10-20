/**
 * State login ringkas untuk komponen client (navbar & RSVP).
 *
 * Layout publik tidak lagi membaca cookie agar halaman publik bisa di-cache
 * (ISR). Komponen client memanggil endpoint ini sekali per kunjungan.
 */
import { NextResponse } from "next/server";

import { getCurrentUser, getUserMenus, isAdminRole } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { userId: null, user: null, panelHref: null },
      { headers: NO_STORE },
    );
  }

  const menus = await getUserMenus(user);
  const hasPanel = isAdminRole(user.role) || menus.length > 0;

  return NextResponse.json(
    {
      userId: user.id,
      user: {
        displayName: user.displayName,
        nickname: user.nickname,
        avatarKey: user.avatarKey,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      panelHref: hasPanel ? "/admin" : null,
    },
    { headers: NO_STORE },
  );
}
