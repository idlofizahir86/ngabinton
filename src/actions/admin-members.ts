"use server";

/**
 * Server Action pengelolaan anggota club oleh pengurus (RULES.md §5.4).
 * Konversi BaturanNgabinton ada di `actions/guests.ts`.
 */
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  contactConflict,
  defaultPasswordFor,
  revalidateMemberViews,
} from "@/actions/member-support";
import { requireMenu } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import type { MemberFormState, ResetPasswordState } from "@/lib/forms/states";
import { DEFAULT_AVATAR_KEY } from "@/lib/members/avatars";
import { createMemberSchema, updateMemberSchema } from "@/lib/validators/member";

/** Admin: tambah anggota club baru (password awal `{username}ngabinton`). */
export async function createMemberAction(
  _prev: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  await requireMenu("members");

  const parsed = createMemberSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    nickname: formData.get("nickname"),
    waNumber: formData.get("waNumber"),
    email: formData.get("email"),
    avatarKey: formData.get("avatarKey") ?? DEFAULT_AVATAR_KEY,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data anggota tidak valid.", ok: false };
  }

  const { username, displayName, nickname, waNumber, email, avatarKey } = parsed.data;

  const conflict = await contactConflict({ username, waNumber, email }, null);
  if (conflict) return { error: conflict, ok: false };

  const created = await db
    .insert(users)
    .values({
      username,
      passwordHash: await hashPassword(defaultPasswordFor(username)),
      displayName,
      nickname,
      waNumber,
      email,
      avatarKey,
      role: "member",
    })
    .returning({ id: users.id });

  if (!created[0]) {
    return { error: "Gagal menyimpan anggota. Coba lagi.", ok: false };
  }

  revalidateMemberViews();
  return { error: null, ok: true };
}

/** Admin: perbarui data anggota (identitas, kontak, avatar, status aktif). */
export async function updateMemberAction(
  _prev: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  await requireMenu("members");

  const memberId = Number(formData.get("memberId"));
  if (!Number.isInteger(memberId)) {
    return { error: "Anggota tidak dikenal.", ok: false };
  }

  const parsed = updateMemberSchema.safeParse({
    displayName: formData.get("displayName"),
    nickname: formData.get("nickname"),
    waNumber: formData.get("waNumber"),
    email: formData.get("email"),
    avatarKey: formData.get("avatarKey") ?? DEFAULT_AVATAR_KEY,
    isActive: formData.get("isActive") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data anggota tidak valid.", ok: false };
  }

  const { displayName, nickname, waNumber, email, avatarKey, isActive } = parsed.data;

  const conflict = await contactConflict({ waNumber, email }, memberId);
  if (conflict) return { error: conflict, ok: false };

  try {
    await db
      .update(users)
      .set({ displayName, nickname, waNumber, email, avatarKey, isActive, updatedAt: new Date() })
      .where(and(eq(users.id, memberId), eq(users.role, "member")));
  } catch {
    return { error: "Gagal menyimpan anggota. Coba lagi sebentar.", ok: false };
  }

  revalidateMemberViews();
  revalidatePath(`/admin/anggota/${memberId}/edit`);
  return { error: null, ok: true };
}

/** Admin: kembalikan password anggota ke default `{username}ngabinton`. */
export async function resetMemberPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireMenu("members");

  const memberId = Number(formData.get("memberId"));
  if (!Number.isInteger(memberId)) {
    return { error: "Anggota tidak dikenal.", ok: false, password: null };
  }

  const rows = await db
    .select({ username: users.username })
    .from(users)
    .where(and(eq(users.id, memberId), eq(users.role, "member")))
    .limit(1);

  const member = rows[0];
  if (!member) {
    return { error: "Anggota tidak ditemukan.", ok: false, password: null };
  }

  const password = defaultPasswordFor(member.username);

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(password), updatedAt: new Date() })
    .where(eq(users.id, memberId));

  revalidatePath(`/admin/anggota/${memberId}/edit`);
  return { error: null, ok: true, password };
}