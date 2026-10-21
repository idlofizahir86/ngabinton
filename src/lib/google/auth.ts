/**
 * Kredensial OAuth Google Drive (server-only).
 *
 * Satu akun Google dipakai untuk seluruh situs (bukan per-user):
 * - Production: refresh token dari `GOOGLE_REFRESH_TOKEN`.
 * - Dev lokal: fallback `.data/google-oauth-token.json` (hasil /api/auth/google).
 *
 * Jangan pernah log objek error gaxios utuh — isinya menyertakan header
 * `Authorization: Bearer <access token>`.
 */
import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import { google } from "googleapis";

/** Scope minimal: hanya file yang dibuat/dibuka aplikasi ini. */
export const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

const DEFAULT_TOKEN_FILE = ".data/google-oauth-token.json";
const DEFAULT_REDIRECT_URI = "http://localhost:3000/api/auth/google/callback";

export interface OAuthClientConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

function absolute(p: string): string {
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

/** Baca client_id/client_secret dari env `GOOGLE_CLIENT_CONFIG` (JSON satu baris). */
export function getClientConfig(): OAuthClientConfig {
  const envConfig = process.env.GOOGLE_CLIENT_CONFIG;
  if (!envConfig) {
    throw new Error("GOOGLE_CLIENT_CONFIG belum diset (lihat .env.example).");
  }

  let json: {
    web?: { client_id?: string; client_secret?: string; redirect_uris?: string[] };
    installed?: { client_id?: string; client_secret?: string; redirect_uris?: string[] };
  };
  try {
    json = JSON.parse(envConfig);
  } catch {
    throw new Error("Format JSON pada GOOGLE_CLIENT_CONFIG tidak valid.");
  }

  const client = json.web ?? json.installed;
  if (!client?.client_id || !client?.client_secret) {
    throw new Error("GOOGLE_CLIENT_CONFIG tidak berisi client_id/client_secret.");
  }

  return {
    clientId: client.client_id,
    clientSecret: client.client_secret,
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ??
      client.redirect_uris?.[0] ??
      DEFAULT_REDIRECT_URI,
  };
}

export function getTokenFilePath(): string {
  return absolute(process.env.GOOGLE_TOKEN_FILE ?? DEFAULT_TOKEN_FILE);
}

/** `GOOGLE_REFRESH_TOKEN` (production) → file lokal (dev). */
export async function readRefreshToken(): Promise<string | null> {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    return process.env.GOOGLE_REFRESH_TOKEN;
  }
  try {
    const raw = await fs.readFile(getTokenFilePath(), "utf-8");
    const parsed = JSON.parse(raw) as { refresh_token?: string };
    return parsed.refresh_token ?? null;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Simpan refresh token (hanya untuk dev lokal).
 * Di Vercel filesystem read-only — pemanggil harus menyuruh admin menyalin
 * token ke env `GOOGLE_REFRESH_TOKEN`.
 */
export async function saveRefreshToken(refreshToken: string): Promise<void> {
  const abs = getTokenFilePath();
  const exists = await fs
    .access(abs)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    await fs.mkdir(path.dirname(abs), { recursive: true });
  }
  await fs.writeFile(abs, JSON.stringify({ refresh_token: refreshToken }, null, 2), {
    mode: 0o600,
  });
  await fs.chmod(abs, 0o600);
}

const globalForGoogle = globalThis as unknown as {
  __ngabintonOAuthClient?: InstanceType<typeof google.auth.OAuth2>;
};

/**
 * Klien OAuth2 berisi refresh token, di-cache agar tidak membuat ulang
 * instance tiap panggilan. googleapis sendiri yang mengurus access token.
 */
export async function getOAuthClient(): Promise<InstanceType<typeof google.auth.OAuth2>> {
  if (globalForGoogle.__ngabintonOAuthClient) {
    return globalForGoogle.__ngabintonOAuthClient;
  }

  const refreshToken = await readRefreshToken();
  if (!refreshToken) {
    throw new Error(
      "Google Drive belum terhubung. Buka /api/auth/google sebagai admin atau set GOOGLE_REFRESH_TOKEN.",
    );
  }

  const { clientId, clientSecret, redirectUri } = getClientConfig();
  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  client.setCredentials({ refresh_token: refreshToken });
  globalForGoogle.__ngabintonOAuthClient = client;
  return client;
}
