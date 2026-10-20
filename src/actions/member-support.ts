/**
 * Helper bersama untuk Server Action pengelolaan anggota.
 * Tanpa `"use server"` — berisi fungsi biasa yang dipakai beberapa action.
 */
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { MEMBER_PASSWORD_SUFFIX } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { matchParticipants, users } from "@/lib/db/schema";

/** Password default anggota: `{username}ngabinton`. */
export function defaultPasswordFor(username: string): string {
  return `${username}${MEMBER_PASSWORD_SUFFIX}`;
}

/** Bandingkan nama tanpa peduli huruf besar/kecil dan spasi tepi. */
export function sameName(a: string | null, b: string): boolean {
  return a !== null && a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Pesan error bila kontak (username/WA/email) sudah dipakai user lain. */
export async function contactConflict(
  values: { username?: string; waNumber?: string | null; email?: string | null },
  exceptId: number | null,
): Promise<string | null> {
  if (values.username) {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, values.username))
      .limit(1);
    const clash = rows[0];
    if (clash && clash.id !== exceptId) return "Username sudah dipakai. Pilih yang lain.";
  }

  if (values.waNumber) {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.waNumber, values.waNumber))
      .limit(1);
    const clash = rows[0];
    if (clash && clash.id !== exceptId) return "Nomor WhatsApp sudah dipakai anggota lain.";
  }

  if (values.email) {
    const rows = await db.select({ id: users.id }).from(users).where(eq(users.email, values.email)).limit(1);
    const clash = rows[0];
    if (clash && clash.id !== exceptId) return "Email sudah dipakai anggota lain.";
  }

  return null;
}

/** Tautkan seluruh riwayat game BaturanNgabinton ke satu akun anggota. */
export async function linkGuestHistory(guestName: string, userId: number): Promise<void> {
  await db
    .update(matchParticipants)
    .set({ userId })
    .where(and(isNull(matchParticipants.userId), eq(matchParticipants.guestName, guestName)));
}

/** Revalidate halaman yang menampilkan data anggota. */
export function revalidateMemberViews(): void {
  // Papan peringkat memuat nama/avatar/status anggota (lihat cache `rankings`).
  revalidateTag("rankings");
  revalidatePath("/admin/anggota");
  revalidatePath("/leaderboard");
}
