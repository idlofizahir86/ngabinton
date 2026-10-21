/**
 * Langkah 1 koneksi Google Drive: arahkan admin ke halaman consent Google.
 * Hanya pengurus — anggota biasa tidak boleh mengganti token aplikasi.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";

import { CodeChallengeMethod } from "google-auth-library";
import { NextResponse, type NextRequest } from "next/server";

import { DRIVE_FILE_SCOPE, getClientConfig } from "@/lib/google/auth";
import { isAdminRole } from "@/lib/auth/guards";
import { getSession } from "@/lib/auth/session";
import { google } from "googleapis";

const STATE_COOKIE = "g_oauth_state";
const VERIFIER_COOKIE = "g_oauth_verifier";

function base64Url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

/** PKCE S256 tanpa perlu import enum dari google-auth-library. */
function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = base64Url(randomBytes(32));
  const challenge = base64Url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("redirect", "/api/auth/google");
    return NextResponse.redirect(login);
  }
  if (!isAdminRole(session.role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { clientId, clientSecret, redirectUri } = getClientConfig();
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const { verifier, challenge } = createPkcePair();
  const state = randomUUID();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // minta refresh token
    prompt: "consent", // paksa consent supaya refresh token selalu terbit
    scope: [DRIVE_FILE_SCOPE],
    state,
    code_challenge: challenge,
    code_challenge_method: CodeChallengeMethod.S256,
  });

  const response = NextResponse.redirect(authUrl);
  const secure = request.nextUrl.protocol === "https:";
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 600,
  };
  // state = anti-CSRF, verifier = PKCE. Hanya hidup selama proses consent.
  response.cookies.set(STATE_COOKIE, state, cookieOptions);
  response.cookies.set(VERIFIER_COOKIE, verifier, cookieOptions);
  return response;
}
