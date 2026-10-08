"use server";

/**
 * Server Actions untuk auth admin.
 * Referensi: `ROUTES.md` §3.1, `RULES.md` §1.1.
 *
 * Catatan: rate limit login BELUM di sini — diimplementasi terpisah di M1-06.
 */
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getUserByUsername } from "@/lib/api/users";
import { signSession } from "@/lib/auth/jwt";
import { comparePassword } from "@/lib/auth/password";
import { checkLoginRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validators/auth";

/** State form login untuk `useActionState`. */
export type LoginState = { error: string | null };

const GENERIC_ERROR = "Username atau password salah.";
const RATE_LIMIT_ERROR = "Terlalu banyak percobaan. Coba lagi dalam 5 menit.";

/** Validasi tujuan redirect: hanya path internal (`RULES.md` §1.3, `ROUTES.md` §5.2). */
function safeRedirectPath(value: unknown): string {
  if (typeof value !== "string") return "/admin";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "/admin";
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
    const { success } = await checkLoginRateLimit(ip);
    if (!success) {
      return { error: RATE_LIMIT_ERROR };
    }
  } catch {
    // Fail closed (RULES.md §0): tolak login kalau rate limiter tak bisa diakses.
    return { error: "Layanan sedang sibuk. Coba lagi sebentar lagi." };
  }

  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  // Pesan seragam untuk semua kegagalan auth (RULES.md §1.1 poin 6).
  if (!parsed.success) {
    return { error: GENERIC_ERROR };
  }

  const { username, password } = parsed.data;
  const user = await getUserByUsername(username);

  if (!user) {
    return { error: GENERIC_ERROR };
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: GENERIC_ERROR };
  }

  if (!user.isActive) {
    return { error: "Akun dinonaktifkan. Hubungi superadmin." };
  }

  const token = await signSession({
    sub: String(user.id),
    username: user.username,
    role: user.role,
  });
  await setSessionCookie(token);

  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  // redirect() melempar NEXT_REDIRECT — jangan dibungkus try/catch.
  redirect(safeRedirectPath(formData.get("redirect")));
}

/** Logout admin — hapus cookie session lalu redirect ke `/login` (`ROUTES.md` §3.1). */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
