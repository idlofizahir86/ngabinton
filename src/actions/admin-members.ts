"use server";

/**
 * Server Actions pengelolaan anggota oleh pengurus (RULES.md §5.2).
 * Termasuk konversi tamu (baturan) menjadi anggota club.
 */
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { recomputeExpForUsers } from "@/lib/api/exp";
import { hashPassword } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/guards";
import { MEMBER_PASSWORD_SUFFIX } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { matchParticipants, users } from "@/lib/db/schema";
import { convertGuestSchema } from "@/lib/validators/match";
import type { ConvertGuestState } from "@/lib/forms/states";

/**
 * Ubah tamu menjadi anggota club: buat akun (password default `{username}ngabinton`),
 * lalu tautkan semua riwayat game tamu tersebut ke akun baru.
 */
export async function convertGuestAction(
  _prev: ConvertGuestState,
  formData: FormData,
): Promise<ConvertGuestState> {
  await requireAdmin();

  const parsed = convertGuestSchema.safeParse({
    guestName: formData.get("guestName"),
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    nickname: formData.get("nickname"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid.", ok: false };
  }

  const { guestName, username, displayName, nickname } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (existing.length > 0) {
    return { error: "Username sudah dipakai. Pilih yang lain.", ok: false };
  }

  const passwordHash = await hashPassword(`${username}${MEMBER_PASSWORD_SUFFIX}`);

  const created = await db
    .insert(users)
    .values({ username, passwordHash, displayName, nickname, role: "member" })
    .returning({ id: users.id });

  const newId = created[0]?.id;
  if (!newId) {
    return { error: "Gagal membuat anggota. Coba lagi.", ok: false };
  }

  await db
    .update(matchParticipants)
    .set({ userId: newId })
    .where(and(isNull(matchParticipants.userId), eq(matchParticipants.guestName, guestName)));

  await recomputeExpForUsers([newId]);

  revalidatePath("/admin/anggota");
  revalidatePath("/leaderboard");
  return { error: null, ok: true };
}
