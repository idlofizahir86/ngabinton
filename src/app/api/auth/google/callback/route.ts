/**
 * Langkah 2 koneksi Google Drive: Google mengembalikan `code`, kita tukar
 * dengan refresh token lalu simpan (dev: `.data/`, production: env Vercel).
 */
import { NextResponse, type NextRequest } from "next/server";
import { google } from "googleapis";

import { isAdminRole } from "@/lib/auth/guards";
import { getSession } from "@/lib/auth/session";
import { getClientConfig, saveRefreshToken } from "@/lib/google/auth";

const STATE_COOKIE = "g_oauth_state";
const VERIFIER_COOKIE = "g_oauth_verifier";

function backToUpload(
  request: NextRequest,
  key: "connected" | "auth_error",
  value: string,
): NextResponse {
  const url = new URL("/dokumentasi/upload", request.nextUrl);
  url.searchParams.set(key, value);
  const response = NextResponse.redirect(url);
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(VERIFIER_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!isAdminRole(session.role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const params = request.nextUrl.searchParams;

  const oauthError = params.get("error");
  if (oauthError) {
    return backToUpload(request, "auth_error", oauthError);
  }

  const code = params.get("code");
  const state = params.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;
  const codeVerifier = request.cookies.get(VERIFIER_COOKIE)?.value;

  // Tolak callback yang tidak berasal dari alur yang kita mulai.
  if (!code || !state || !cookieState || state !== cookieState || !codeVerifier) {
    return backToUpload(request, "auth_error", "state_mismatch");
  }

  try {
    const { clientId, clientSecret, redirectUri } = getClientConfig();
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken({ code, codeVerifier });

    if (!tokens.refresh_token) {
      return backToUpload(request, "auth_error", "no_refresh_token");
    }

    try {
      await saveRefreshToken(tokens.refresh_token);
    } catch (err) {
      // Vercel read-only — admin harus menyalin token ke env GOOGLE_REFRESH_TOKEN.
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS" || code === "EACCES") {
        return backToUpload(request, "auth_error", "token_not_saved");
      }
      throw err;
    }

    return backToUpload(request, "connected", "1");
  } catch (err) {
    // Jangan log isi token; cukup pesan errornya.
    console.error(
      "[oauth callback]",
      err instanceof Error ? err.message : "unknown error",
    );
    return backToUpload(request, "auth_error", "exchange_failed");
  }
}
