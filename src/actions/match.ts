"use server";

/**
 * Server Actions pencatatan permainan (admin/pengurus) — RULES.md §13.
 * Sesi bermain harus dibuat dulu sebelum game bisa dicatat.
 */
import { count, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { syncAchievements } from "@/lib/api/achievements";
import { recomputeExpForUsers } from "@/lib/api/exp";
import { requireMenu } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { matchParticipants, matches, matchSets, playSessions, users } from "@/lib/db/schema";
import type { MatchFormState, SessionFormState } from "@/lib/forms/states";
import { parseJakartaLocal } from "@/lib/utils/jakarta";
import { playSessionSchema, recordMatchSchema } from "@/lib/validators/match";

/** Buat sesi bermain baru → redirect ke detail sesi. */
export async function createSessionAction(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const session = await requireMenu("matches");

  const parsed = playSessionSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    playedAt: formData.get("playedAt"),
    endedAt: formData.get("endedAt"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data sesi tidak valid." };
  }

  const playedAt = parseJakartaLocal(parsed.data.playedAt);
  if (!playedAt) {
    return { error: "Tanggal & jam mulai tidak valid." };
  }
  const endedAt = parsed.data.endedAt ? parseJakartaLocal(parsed.data.endedAt) : null;

  const created = await db
    .insert(playSessions)
    .values({
      title: parsed.data.title,
      location: parsed.data.location,
      playedAt,
      endedAt,
      notes: parsed.data.notes,
      createdBy: Number(session.sub),
    })
    .returning({ id: playSessions.id });

  const id = created[0]?.id;
  if (!id) {
    return { error: "Gagal membuat sesi. Coba lagi." };
  }

  revalidatePath("/admin/sesi");
  redirect(`/admin/sesi/${id}`);
}

/** Catat satu game di dalam sesi (peserta 1–N per sisi, 1–N set). */
export async function recordMatchAction(
  _prev: MatchFormState,
  formData: FormData,
): Promise<MatchFormState> {
  const authSession = await requireMenu("matches");

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "Format data game tidak valid.", ok: false };
  }

  const parsed = recordMatchSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data game tidak valid.", ok: false };
  }

  const { sessionId, label, notes, sideA, sideB, sets } = parsed.data;

  const sessionExists = await db
    .select({ id: playSessions.id })
    .from(playSessions)
    .where(eq(playSessions.id, sessionId))
    .limit(1);
  if (sessionExists.length === 0) {
    return { error: "Sesi tidak ditemukan. Buat sesi dulu.", ok: false };
  }

  const memberIds = [...sideA, ...sideB]
    .filter((p) => p.kind === "member" && p.userId)
    .map((p) => Number(p.userId));
  const nameById = new Map<number, string>();
  if (memberIds.length > 0) {
    const rows = await db
      .select({ id: users.id, displayName: users.displayName, nickname: users.nickname })
      .from(users)
      .where(inArray(users.id, memberIds));
    for (const row of rows) {
      nameById.set(row.id, row.nickname?.trim() || row.displayName);
    }
  }

  const orderRow = await db
    .select({ max: sql<number>`coalesce(max(${matches.order}), 0)::int` })
    .from(matches)
    .where(eq(matches.sessionId, sessionId));
  const nextOrder = (orderRow[0]?.max ?? 0) + 1;
  const createdBy = Number(authSession.sub);

  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(matches)
      .values({
        sessionId,
        order: nextOrder,
        label,
        notes,
        createdBy: Number.isInteger(createdBy) ? createdBy : null,
      })
      .returning({ id: matches.id });
    const matchId = inserted[0]?.id;
    if (!matchId) throw new Error("Gagal menyimpan game.");

    const rows = [
      ...sideA.map((p) => ({ p, side: "a" as const })),
      ...sideB.map((p) => ({ p, side: "b" as const })),
    ].map(({ p, side }) => ({
      matchId,
      side,
      userId: p.kind === "member" && p.userId ? Number(p.userId) : null,
      guestName: p.kind === "guest" ? (p.guestName?.trim() ?? null) : null,
      displayName:
        p.kind === "member" && p.userId
          ? nameById.get(Number(p.userId)) ?? "Anggota"
          : (p.guestName?.trim() ?? "BaturanNgabinton"),
    }));

    await tx.insert(matchParticipants).values(rows);
    await tx.insert(matchSets).values(
      sets.map((set, index) => ({
        matchId,
        setNumber: index + 1,
        scoreA: set.scoreA,
        scoreB: set.scoreB,
      })),
    );
  });

  await recomputeExpForUsers(memberIds);
  await syncAchievements();

  revalidateTag("rankings", "max");
  revalidatePath("/leaderboard");
  revalidatePath(`/admin/sesi/${sessionId}`);
  revalidatePath("/admin/sesi");
  revalidatePath("/member");
  return { error: null, ok: true };
}

/** Hapus satu game + hitung ulang EXP pemainnya. */
export async function deleteMatchAction(formData: FormData): Promise<void> {
  await requireMenu("matches");
  const matchId = String(formData.get("matchId") ?? "");
  if (!matchId) return;

  const rows = await db
    .select({ userId: matchParticipants.userId, sessionId: matches.sessionId })
    .from(matchParticipants)
    .innerJoin(matches, eq(matches.id, matchParticipants.matchId))
    .where(eq(matchParticipants.matchId, matchId));

  const memberIds = rows.map((r) => r.userId).filter((id): id is number => id !== null);
  const sessionId = rows[0]?.sessionId;

  await db.delete(matches).where(eq(matches.id, matchId));
  await recomputeExpForUsers(memberIds);

  revalidateTag("rankings", "max");
  revalidatePath("/leaderboard");
  revalidatePath("/admin/sesi");
  if (sessionId) revalidatePath(`/admin/sesi/${sessionId}`);
}

/** Ubah data sesi bermain (judul, lokasi, jadwal, catatan) → redirect ke detail. */
export async function updateSessionAction(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  await requireMenu("matches");

  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) {
    return { error: "Sesi tidak valid." };
  }

  const parsed = playSessionSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    playedAt: formData.get("playedAt"),
    endedAt: formData.get("endedAt"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data sesi tidak valid." };
  }

  const playedAt = parseJakartaLocal(parsed.data.playedAt);
  if (!playedAt) {
    return { error: "Tanggal & jam mulai tidak valid." };
  }
  const endedAt = parsed.data.endedAt ? parseJakartaLocal(parsed.data.endedAt) : null;

  const existing = await db
    .select({ id: playSessions.id })
    .from(playSessions)
    .where(eq(playSessions.id, sessionId))
    .limit(1);
  if (existing.length === 0) {
    return { error: "Sesi tidak ditemukan." };
  }

  await db
    .update(playSessions)
    .set({
      title: parsed.data.title,
      location: parsed.data.location,
      playedAt,
      endedAt,
      notes: parsed.data.notes,
      updatedAt: new Date(),
    })
    .where(eq(playSessions.id, sessionId));

  revalidatePath("/admin/sesi");
  revalidatePath(`/admin/sesi/${sessionId}`);
  revalidatePath("/");
  redirect(`/admin/sesi/${sessionId}`);
}

/**
 * Hapus sesi bermain.
 * **Dilarang** kalau sudah ada game tercatat di sesi itu (`RULES.md` §13.1) —
 * hapus semua game dulu agar EXP tidak ikut hilang tanpa disadari.
 */
export async function deleteSessionAction(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  await requireMenu("matches");

  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) {
    return { error: "Sesi tidak valid." };
  }

  const counted = await db
    .select({ value: count(matches.id) })
    .from(matches)
    .where(eq(matches.sessionId, sessionId));
  const gameCount = counted[0]?.value ?? 0;

  if (gameCount > 0) {
    return {
      error: `Sesi tidak bisa dihapus: sudah ada ${gameCount} game tercatat. Hapus semua game dulu.`,
    };
  }

  await db.delete(playSessions).where(eq(playSessions.id, sessionId));

  // Transaksi sesi jadi kas umum (FK set null) & papan peringkat berubah.
  revalidateTag("finance", "max");
  revalidateTag("rankings", "max");
  revalidatePath("/admin/sesi");
  revalidatePath("/");
  redirect("/admin/sesi");
}
