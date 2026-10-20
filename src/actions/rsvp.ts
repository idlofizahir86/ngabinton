"use server";

/**
 * Server Actions polling kehadiran sesi bermain (RULES.md §14).
 * Wajib login. Satu anggota = satu pilihan per sesi; klik pilihan yang sama
 * akan membatalkan (toggle).
 */
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { sessionRsvps } from "@/lib/db/schema";
import { rsvpSchema } from "@/lib/validators/match";

/** Set / ubah / batalkan rencana hadir pada sebuah sesi. */
export async function setRsvpAction(formData: FormData): Promise<void> {
  const session = await requireUser();
  const userId = Number(session.sub);
  if (!Number.isInteger(userId)) return;

  const parsed = rsvpSchema.safeParse({
    sessionId: formData.get("sessionId"),
    choice: formData.get("choice"),
  });
  if (!parsed.success) return;

  const { sessionId, choice } = parsed.data;

  const existing = await db
    .select({ id: sessionRsvps.id, choice: sessionRsvps.choice })
    .from(sessionRsvps)
    .where(and(eq(sessionRsvps.sessionId, sessionId), eq(sessionRsvps.userId, userId)))
    .limit(1);

  const current = existing[0];

  if (current && current.choice === choice) {
    await db.delete(sessionRsvps).where(eq(sessionRsvps.id, current.id));
  } else if (current) {
    await db
      .update(sessionRsvps)
      .set({ choice, updatedAt: new Date() })
      .where(eq(sessionRsvps.id, current.id));
  } else {
    await db.insert(sessionRsvps).values({ sessionId, userId, choice });
  }

  revalidatePath("/");
  revalidatePath("/sesi");
  revalidatePath(`/sesi/${sessionId}`);
}
