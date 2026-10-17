"use server";

/**
 * Server Actions untuk auth.
 * Referensi: `ROUTES.md` §3.1, `RULES.md` §1.1.
 *
 * Login menerima **username atau nomor WhatsApp** + password. Setelah sukses,
 * admin diarahkan ke `/admin`, anggota club ke `/member`.
 */
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { getUserByIdentifier } from "@/lib/api/users";
import { signSession } from "@/lib/auth/jwt";
import { comparePassword } from "@/lib/auth/password";
import { checkLoginRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validators/auth";

/** State form login untuk `useActionState`. */
export type LoginState = { error: string | null };

const GENERIC_ERROR = "Username/No. WA atau password salah.";
const RATE_LIMIT_ERROR = "Terlalu banyak percobaan. Coba lagi dalam 5 menit.";
const SERVICE_BUSY_ERROR = "Layanan sedang sibuk. Coba lagi sebentar lagi.";

/** Halaman mendarat sesuai role. */
function homeForRole(role: "admin" | "superadmin" | "member"): string {
  return role === "member" ? "/member" : "/admin";
}

/** Validasi tujuan redirect: hanya path internal (`RULES.md` §1.3, `ROUTES.md` §5.2). */
function safeRedirectPath(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }
  return value;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = await getClientIp();

  // Rate limit: 5 percobaan / 5 menit / IP (RULES.md §1.1 & §9).
  try {
    const { success, reason } = await checkLoginRateLimit(ip);
    if (!success) {
      // `reason: "timeout"` = Redis tak menjawab, bukan kuota percobaan habis.
      return { error: reason === "timeout" ? SERVICE_BUSY_ERROR : RATE_LIMIT_ERROR };
    }
  } catch {
    // Fail closed (RULES.md §0): tolak login kalau rate limiter tak bisa diakses.
    return { error: SERVICE_BUSY_ERROR };
  }

  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  // Pesan seragam untuk semua kegagalan auth (RULES.md §1.1 poin 6).
  if (!parsed.success) {
    return { error: GENERIC_ERROR };
  }

  const { identifier, password } = parsed.data;
  const user = await getUserByIdentifier(identifier);

  if (!user) {
    return { error: GENERIC_ERROR };
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: GENERIC_ERROR };
  }

  if (!user.isActive) {
    return { error: "Akun dinonaktifkan. Hubungi admin utama." };
  }

  const token = await signSession({
    sub: String(user.id),
    username: user.username,
    role: user.role,
  });
  await setSessionCookie(token);

  // `last_login_at` tidak perlu ditunggu sebelum redirect — jalankan setelah
  // response terkirim supaya tidak menambah satu round-trip ke DB di jalur login.
  after(async () => {
    try {
      await db
        .update(users)
        .set({ lastLoginAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, user.id));
    } catch {
      // Gagal mencatat waktu login tidak boleh menggagalkan login.
    }
  });

  const fallback = homeForRole(user.role);
  // redirect() melempar NEXT_REDIRECT — jangan dibungkus try/catch.
  redirect(safeRedirectPath(formData.get("redirect"), fallback));
}

/** Logout — hapus cookie session lalu redirect ke `/login` (`ROUTES.md` §3.1). */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
