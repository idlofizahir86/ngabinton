/**
 * Rate limiting (Upstash Redis).
 * Referensi: `RULES.md` §9.
 *
 * Server-only. Butuh `UPSTASH_REDIS_URL` & `UPSTASH_REDIS_TOKEN`.
 *
 * Cast pada `globalThis` karena tidak punya tipe untuk cache kita;
 * tujuan cache: hindari re-init `Redis`/`Ratelimit` tiap hot-reload.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

/** Login: 5 percobaan / 5 menit (`RULES.md` §9). */
const LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW = "5 m";
const LOGIN_PREFIX = "ratelimit:login";

/**
 * Batas waktu satu panggilan rate limit. Default Upstash 5 detik + 5 retry
 * (backoff eksponensial s/d ~3 detik) membuat login bisa menggantung >5 detik
 * saat Redis sedang bermasalah — jadi retry & timeout dibatasi di sini.
 */
const REDIS_TIMEOUT_MS = 2500;
const REDIS_RETRIES = 2;

const globalForRateLimit = globalThis as unknown as {
  __ngabintonRedis?: Redis;
  __ngabintonLoginLimiter?: Ratelimit;
};

function getRedis(): Redis {
  if (!globalForRateLimit.__ngabintonRedis) {
    const url = process.env.UPSTASH_REDIS_URL;
    const token = process.env.UPSTASH_REDIS_TOKEN;
    if (!url || !token) {
      throw new Error("UPSTASH_REDIS_URL / UPSTASH_REDIS_TOKEN belum diset (SETUP.md §5).");
    }
    globalForRateLimit.__ngabintonRedis = new Redis({
      url,
      token,
      retry: { retries: REDIS_RETRIES, backoff: (retryCount) => 50 * 2 ** retryCount },
    });
  }
  return globalForRateLimit.__ngabintonRedis;
}

function getLoginLimiter(): Ratelimit {
  if (!globalForRateLimit.__ngabintonLoginLimiter) {
    globalForRateLimit.__ngabintonLoginLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(LOGIN_ATTEMPTS, LOGIN_WINDOW),
      prefix: LOGIN_PREFIX,
      timeout: REDIS_TIMEOUT_MS,
    });
  }
  return globalForRateLimit.__ngabintonLoginLimiter;
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  /** Epoch ms kapan limit di-reset (untuk `Retry-After` bila perlu). */
  reset: number;
  /** `"timeout"` berarti Redis tidak menjawab — bukan berarti kuota habis. */
  reason?: string;
};

/** Cek & catat percobaan login untuk sebuah IP. */
export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  const { success, remaining, reset, reason } = await getLoginLimiter().limit(ip);
  return { success, remaining, reset, reason };
}

/** Ambil IP client dari header (Vercel menyetel `x-forwarded-for`). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) {
      return first.trim();
    }
  }
  return h.get("x-real-ip") ?? "unknown";
}
