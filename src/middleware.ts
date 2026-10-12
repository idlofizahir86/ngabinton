import { NextResponse, type NextRequest } from "next/server";

import { verifySession } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

/**
 * Proteksi route `/admin/*` (pengurus) & `/member/*` (anggota club) —
 * `RULES.md` §1.3. Anggota club tidak boleh masuk `/admin`.
 *
 * Catatan: karena project memakai `src/`, middleware harus di `src/middleware.ts`.
 * Edge runtime: hanya boleh import modul edge-safe (tanpa Drizzle/bcrypt).
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const { pathname, search } = request.nextUrl;

  // Anggota club yang mencoba buka /admin → arahkan ke area member.
  if (session && pathname.startsWith("/admin") && session.role === "member") {
    return NextResponse.redirect(new URL("/member", request.url));
  }

  if (session) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname + search);

  const response = NextResponse.redirect(loginUrl);
  if (token) {
    // Token ada tapi invalid/expired → hapus cookie basi.
    response.cookies.delete(SESSION_COOKIE_NAME);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*"],
};
