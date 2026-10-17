"use server";

/**
 * Server Action assign menu area pengurus (RULES.md §5.5).
 * Hanya admin/superadmin yang boleh memberi atau mencabut akses.
 */
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { replaceMenuAccess } from "@/lib/api/access";
import { syncRoleBadges } from "@/lib/api/achievements";
import { requireAdmin } from "@/lib/auth/guards";
import { MENU_KEYS, type MenuKey } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import type { AccessFormState } from "@/lib/forms/states";

function isMenuKey(value: string): value is MenuKey {
  return (MENU_KEYS as readonly string[]).includes(value);
}

/** Simpan daftar menu yang boleh diakses seorang anggota. */
export async function updateMenuAccessAction(
  _prev: AccessFormState,
  formData: FormData,
): Promise<AccessFormState> {
  const session = await requireAdmin();

  const userId = Number(formData.get("userId"));
  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "User tidak dikenal.", ok: false };
  }

  const target = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isActive, true)))
    .limit(1);

  if (!target[0] || target[0].role !== "member") {
    return { error: "Hanya anggota aktif yang bisa diberi akses menu.", ok: false };
  }

  const menus = formData
    .getAll("menu")
    .map((value) => String(value))
    .filter(isMenuKey);

  try {
    const grantedBy = Number(session.sub);
    await replaceMenuAccess(userId, menus, Number.isInteger(grantedBy) ? grantedBy : null);
    await syncRoleBadges();
  } catch {
    return { error: "Gagal menyimpan akses. Coba lagi.", ok: false };
  }

  revalidatePath("/admin/akses");
  revalidatePath("/admin");
  return { error: null, ok: true };
}
