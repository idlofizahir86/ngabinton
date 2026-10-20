"use server";

/**
 * Penandaan kehadiran nyata (Real Hadir) sebuah sesi bermain — RULES.md §14.2.
 *
 * Hanya untuk anggota yang datang tapi tidak tercatat di game mana pun; peserta
 * game otomatis dihitung hadir lewat `getSessionAttendance()`.
 */
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMenu } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { playSessions, sessionAttendances, users } from "@/lib/db/schema";
import { sessionAttendanceSchema } from "@/lib/validators/match";

const attendanceIdSchema = z.string().uuid();

function revalidateSession(sessionId: string) {
  revalidatePath("/sesi");
  revalidatePath(`/sesi/${sessionId}`);
  revalidatePath("/admin/sesi");
  revalidatePath(`/admin/sesi/${sessionId}`);
  revalidatePath("/member");
}

/** Tandai satu anggota atau BaturanNgabinton hadir pada sesi (idempotent). */
export async function addSessionAttendanceAction(formData: FormData): Promise<void> {
  const authSession = await requireMenu("matches");

  const parsed = sessionAttendanceSchema.safeParse({
    sessionId: formData.get("sessionId"),
    userId: formData.get("userId"),
    guestName: formData.get("guestName"),
  });
  if (!parsed.success) return;

  const { sessionId, guestName } = parsed.data;

  const sessionRow = await db
    .select({ id: playSessions.id })
    .from(playSessions)
    .where(eq(playSessions.id, sessionId))
    .limit(1);

  if (sessionRow.length === 0) return;

  const markedBy = Number(authSession.sub);
  const markedById = Number.isInteger(markedBy) ? markedBy : null;

  if (parsed.data.userId) {
    const userId = Number(parsed.data.userId);
    const memberRow = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.role, "member"), eq(users.isActive, true)))
      .limit(1);

    if (memberRow.length === 0) return;

    await db
      .insert(sessionAttendances)
      .values({ sessionId, userId, markedBy: markedById })
      .onConflictDoNothing();
  } else if (guestName) {
    const existingGuest = await db
      .select({ id: sessionAttendances.id })
      .from(sessionAttendances)
      .where(
        and(
          eq(sessionAttendances.sessionId, sessionId),
          sql`lower(trim(${sessionAttendances.guestName})) = ${guestName.trim().toLowerCase()}`,
        ),
      )
      .limit(1);

    if (existingGuest.length > 0) return;

    await db
      .insert(sessionAttendances)
      .values({ sessionId, guestName, markedBy: markedById })
      .onConflictDoNothing();
  }

  revalidateSession(sessionId);
}

/** Batalkan penandaan kehadiran manual (peserta game tetap terhitung hadir). */
export async function removeSessionAttendanceAction(formData: FormData): Promise<void> {
  await requireMenu("matches");

  const attendanceId = attendanceIdSchema.safeParse(formData.get("attendanceId"));
  const sessionId = z.string().uuid().safeParse(formData.get("sessionId"));
  if (!attendanceId.success || !sessionId.success) return;

  await db
    .delete(sessionAttendances)
    .where(
      and(
        eq(sessionAttendances.id, attendanceId.data),
        eq(sessionAttendances.sessionId, sessionId.data),
      ),
    );

  revalidateSession(sessionId.data);
}
