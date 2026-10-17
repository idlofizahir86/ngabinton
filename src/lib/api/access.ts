/**
 * Query hak akses menu area pengurus (RULES.md §5.5).
 */
import { and, asc, eq } from "drizzle-orm";

import type { MenuKey } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { userMenuAccess, users } from "@/lib/db/schema";

/** Menu yang di-assign ke satu user. */
export async function getMenuAccess(userId: number): Promise<MenuKey[]> {
  const rows = await db
    .select({ menu: userMenuAccess.menu })
    .from(userMenuAccess)
    .where(eq(userMenuAccess.userId, userId));
  return rows.map((row) => row.menu);
}

/** Peta `userId → MenuKey[]` untuk semua user yang punya akses. */
export async function getMenuAccessMap(): Promise<Map<number, MenuKey[]>> {
  const rows = await db
    .select({ userId: userMenuAccess.userId, menu: userMenuAccess.menu })
    .from(userMenuAccess);

  const map = new Map<number, MenuKey[]>();
  for (const row of rows) {
    const list = map.get(row.userId) ?? [];
    list.push(row.menu);
    map.set(row.userId, list);
  }
  return map;
}

/** User non-admin yang bisa menerima akses menu. */
export async function getAssignableUsers() {
  return db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      nickname: users.nickname,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(and(eq(users.role, "member"), eq(users.isActive, true)))
    .orderBy(asc(users.displayName));
}

/** Ganti seluruh menu akses seorang user (transaksional). */
export async function replaceMenuAccess(
  userId: number,
  menus: MenuKey[],
  grantedBy: number | null,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(userMenuAccess).where(eq(userMenuAccess.userId, userId));
    if (menus.length === 0) return;
    await tx.insert(userMenuAccess).values(
      menus.map((menu) => ({ userId, menu, grantedBy })),
    );
  });
}
