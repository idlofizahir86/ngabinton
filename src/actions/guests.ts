"use server";

/**
 * Server Action konversi BaturanNgabinton menjadi anggota club (RULES.md §5.4).
 */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  contactConflict,
  defaultPasswordFor,
  linkGuestHistory,
  revalidateMemberViews,
  sameName,
} from "@/actions/member-support";
import { promoteGuestAchievements, syncAchievements } from "@/lib/api/achievements";
import { recomputeExpForUsers } from "@/lib/api/exp";
import { getGuests } from "@/lib/api/matches";
import { requireMenu } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import type { ConvertAllState, ConvertGuestState } from "@/lib/forms/states";
import { uniqueUsernameFromName } from "@/lib/members/username";
import { convertGuestSchema } from "@/lib/validators/match";

/**
 * Ubah satu BaturanNgabinton menjadi anggota club: buat akun (password default `{username}ngabinton`),
 * lalu tautkan semua riwayat game BaturanNgabinton tersebut ke akun baru.
 */
export async function convertGuestAction(
  _prev: ConvertGuestState,
  formData: FormData,
): Promise<ConvertGuestState> {
  await requireMenu("members");

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

  const conflict = await contactConflict({ username }, null);
  if (conflict) return { error: conflict, ok: false };

  const created = await db
    .insert(users)
    .values({
      username,
      passwordHash: await hashPassword(defaultPasswordFor(username)),
      displayName,
      nickname,
      role: "member",
    })
    .returning({ id: users.id });

  const newId = created[0]?.id;
  if (!newId) {
    return { error: "Gagal membuat anggota. Coba lagi.", ok: false };
  }

  await linkGuestHistory(guestName, newId);
  await recomputeExpForUsers([newId]);
  await promoteGuestAchievements(guestName, newId);
  await syncAchievements();

  revalidateMemberViews();
  return { error: null, ok: true };
}

/**
 * Konversi **semua** BaturanNgabinton sekaligus.
 * Nama yang sudah cocok dengan anggota terdaftar langsung ditautkan (tanpa akun baru);
 * sisanya dibuatkan akun dengan username otomatis dari namanya.
 * Riwayat game & EXP BaturanNgabinton otomatis ikut terbawa.
 */
export async function convertAllGuestsAction(
  _prev: ConvertAllState,
  _formData: FormData,
): Promise<ConvertAllState> {
  await requireMenu("members");

  const guests = await getGuests();
  if (guests.length === 0) {
    return { error: null, ok: true, created: [], linked: [] };
  }

  const taken = new Set(
    (await db.select({ username: users.username }).from(users)).map((row) => row.username),
  );
  const members = await db
    .select({ id: users.id, displayName: users.displayName, nickname: users.nickname })
    .from(users)
    .where(eq(users.role, "member"));

  const created: string[] = [];
  const linked: string[] = [];
  const touchedIds: number[] = [];

  for (const guest of guests) {
    const existing = members.find(
      (member) =>
        sameName(member.displayName, guest.guestName) || sameName(member.nickname, guest.guestName),
    );

    let userId: number;
    if (existing) {
      userId = existing.id;
      linked.push(`${guest.guestName} → ${existing.displayName}`);
    } else {
      const username = uniqueUsernameFromName(guest.guestName, taken);
      taken.add(username);

      const inserted = await db
        .insert(users)
        .values({
          username,
          passwordHash: await hashPassword(defaultPasswordFor(username)),
          displayName: guest.guestName,
          role: "member",
        })
        .returning({ id: users.id });

      const newId = inserted[0]?.id;
      if (!newId) continue;

      userId = newId;
      created.push(`${guest.guestName} · @${username} · ${defaultPasswordFor(username)}`);
    }

    await linkGuestHistory(guest.guestName, userId);
    await promoteGuestAchievements(guest.guestName, userId);
    touchedIds.push(userId);
  }

  await recomputeExpForUsers(touchedIds);
  await syncAchievements();

  revalidateMemberViews();
  revalidatePath("/sesi");
  return { error: null, ok: true, created, linked };
}
