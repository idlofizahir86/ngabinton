/**
 * Guard akses berbasis sesi untuk Server Component / Server Action.
 * Middleware hanya mencegah bila TIDAK ada sesi; guard ini menegakkan role.
 */
import { redirect } from "next/navigation";

import { getMenuAccess } from "@/lib/api/access";
import { getUserProfile } from "@/lib/api/users";
import { type SessionPayload } from "@/lib/auth/jwt";
import { getSession } from "@/lib/auth/session";
import { MENU_KEYS, type MenuKey } from "@/lib/constants";
import type { PublicMember } from "@/lib/types/member";

export type Role = "admin" | "superadmin" | "member";

/** True kalau role termasuk pengurus (bisa akses seluruh `/admin`). */
export function isAdminRole(role: Role): boolean {
  return role === "admin" || role === "superadmin";
}

/** Menu yang boleh dibuka user: pengurus dapat semua, anggota sesuai grant. */
export async function getUserMenus(user: PublicMember): Promise<MenuKey[]> {
  if (isAdminRole(user.role)) return [...MENU_KEYS];
  return getMenuAccess(user.id);
}

/** Ambil profil lengkap user yang sedang login (atau `null`). */
export async function getCurrentUser(): Promise<PublicMember | null> {
  const session = await getSession();
  if (!session) return null;
  const id = Number(session.sub);
  if (!Number.isInteger(id)) return null;
  return getUserProfile(id);
}

/** Wajib sesi valid; kalau tidak → redirect ke `/login`. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/** Wajib sesi pengurus; anggota club diarahkan ke `/member`. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (!isAdminRole(session.role)) {
    redirect("/member");
  }
  return session;
}

/**
 * Wajib sesi dengan akses menu tertentu (`RULES.md` §5.5).
 * Pengurus lolos otomatis; anggota tanpa grant diarahkan ke `/member`.
 */
export async function requireMenu(menu: MenuKey): Promise<SessionPayload> {
  const session = await requireUser();
  if (isAdminRole(session.role)) return session;

  const userId = Number(session.sub);
  const menus = Number.isInteger(userId) ? await getMenuAccess(userId) : [];
  if (!menus.includes(menu)) {
    redirect("/member");
  }
  return session;
}
