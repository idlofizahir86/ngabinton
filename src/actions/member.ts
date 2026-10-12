"use server";

/**
 * Server Actions untuk anggota club (area `/member`).
 */
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { updateProfileSchema } from "@/lib/validators/member";
import type { ProfileState } from "@/lib/forms/states";

/** Perbarui profil anggota: nama, nama punggung, no. WA, email, dan avatar. */
export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await requireUser();

  const parsed = updateProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    nickname: formData.get("nickname"),
    waNumber: formData.get("waNumber"),
    email: formData.get("email"),
    avatarKey: formData.get("avatarKey"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data profil tidak valid.", ok: false };
  }

  const id = Number(session.sub);
  if (!Number.isInteger(id)) {
    return { error: "Sesi tidak valid. Coba login ulang.", ok: false };
  }

  const { displayName, nickname, waNumber, email, avatarKey } = parsed.data;

  if (waNumber) {
    const duplicate = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.waNumber, waNumber), ne(users.id, id)))
      .limit(1);
    if (duplicate.length > 0) {
      return { error: "Nomor WhatsApp sudah dipakai anggota lain.", ok: false };
    }
  }

  if (email) {
    const duplicate = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, id)))
      .limit(1);
    if (duplicate.length > 0) {
      return { error: "Email sudah dipakai anggota lain.", ok: false };
    }
  }

  try {
    await db
      .update(users)
      .set({ displayName, nickname, waNumber, email, avatarKey, updatedAt: new Date() })
      .where(eq(users.id, id));
  } catch {
    return { error: "Gagal menyimpan profil. Coba lagi sebentar.", ok: false };
  }

  revalidatePath("/member");
  revalidatePath("/member/profil");
  revalidatePath("/leaderboard");
  return { error: null, ok: true };
}
