"use server";

/**
 * Server Action pengelolaan badge kustom (RULES.md §13.7).
 * Hanya admin/superadmin.
 */
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { syncAchievements, syncRoleBadges } from "@/lib/api/achievements";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import {
  achievementDefinitions,
  eventOrganizers,
  events,
  memberAchievements,
  users,
} from "@/lib/db/schema";
import type {
  AwardFormState,
  DefinitionFormState,
  OrganizerFormState,
} from "@/lib/forms/states";
import {
  achievementDefinitionSchema,
  achievementDefinitionUpdateSchema,
  awardCustomAchievementSchema,
} from "@/lib/validators/achievement";
import { eventOrganizerSchema } from "@/lib/validators/organizer";

function revalidateAchievementViews() {
  revalidatePath("/admin/pencapaian");
  revalidatePath("/leaderboard");
  revalidatePath("/member");
}

/** Buat definisi badge kustom baru. */
export async function createAchievementDefinitionAction(
  _prev: DefinitionFormState,
  formData: FormData,
): Promise<DefinitionFormState> {
  const session = await requireAdmin();

  const parsed = achievementDefinitionSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    icon: formData.get("icon") ?? "award",
    tone: formData.get("tone") ?? "primary",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data badge tidak valid.", ok: false };
  }

  const existing = await db
    .select({ id: achievementDefinitions.id })
    .from(achievementDefinitions)
    .where(eq(achievementDefinitions.code, parsed.data.code))
    .limit(1);
  if (existing.length > 0) {
    return { error: "Kode badge sudah dipakai. Gunakan kode lain.", ok: false };
  }

  const createdBy = Number(session.sub);

  try {
    await db.insert(achievementDefinitions).values({
      ...parsed.data,
      createdBy: Number.isInteger(createdBy) ? createdBy : null,
    });
  } catch {
    return { error: "Gagal menyimpan badge. Coba lagi.", ok: false };
  }

  revalidateAchievementViews();
  return { error: null, ok: true };
}

/** Ubah nama/deskripsi/ikon/warna badge. Kode tidak diubah. */
export async function updateAchievementDefinitionAction(
  _prev: DefinitionFormState,
  formData: FormData,
): Promise<DefinitionFormState> {
  await requireAdmin();

  const definitionId = String(formData.get("definitionId") ?? "");
  if (!definitionId) return { error: "Badge tidak valid.", ok: false };

  const parsed = achievementDefinitionUpdateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    icon: formData.get("icon") ?? "award",
    tone: formData.get("tone") ?? "primary",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data badge tidak valid.", ok: false };
  }

  await db
    .update(achievementDefinitions)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(achievementDefinitions.id, definitionId));

  revalidateAchievementViews();
  return { error: null, ok: true };
}

/** Aktifkan / nonaktifkan badge (badge nonaktif tidak bisa diberikan lagi). */
export async function toggleAchievementDefinitionAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const definitionId = String(formData.get("definitionId") ?? "");
  if (!definitionId) return;

  const rows = await db
    .select({ isActive: achievementDefinitions.isActive })
    .from(achievementDefinitions)
    .where(eq(achievementDefinitions.id, definitionId))
    .limit(1);

  if (!rows[0]) return;

  await db
    .update(achievementDefinitions)
    .set({ isActive: !rows[0].isActive, updatedAt: new Date() })
    .where(eq(achievementDefinitions.id, definitionId));

  revalidateAchievementViews();
}

/** Berikan badge kustom ke satu anggota. */
export async function awardCustomAchievementAction(
  _prev: AwardFormState,
  formData: FormData,
): Promise<AwardFormState> {
  await requireAdmin();

  const parsed = awardCustomAchievementSchema.safeParse({
    memberId: formData.get("memberId"),
    definitionId: formData.get("definitionId"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data pemberian badge tidak valid.",
      ok: false,
      duplicate: false,
    };
  }

  const [member] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(eq(users.id, parsed.data.memberId), eq(users.role, "member"), eq(users.isActive, true)),
    )
    .limit(1);
  if (!member) {
    return { error: "Anggota tidak ditemukan atau tidak aktif.", ok: false, duplicate: false };
  }

  const [definition] = await db
    .select()
    .from(achievementDefinitions)
    .where(eq(achievementDefinitions.id, parsed.data.definitionId))
    .limit(1);
  if (!definition || !definition.isActive) {
    return { error: "Badge tidak ditemukan atau sudah nonaktif.", ok: false, duplicate: false };
  }

  const inserted = await db
    .insert(memberAchievements)
    .values({
      type: "custom",
      code: `custom_${definition.code}`,
      subjectKey: `user:${member.id}`,
      userId: member.id,
      definitionId: definition.id,
      icon: definition.icon,
      tone: definition.tone,
      periodKey: "all",
      label: definition.name,
      description: parsed.data.note ?? definition.description,
    })
    .onConflictDoNothing()
    .returning({ id: memberAchievements.id });

  revalidateAchievementViews();

  if (inserted.length === 0) {
    return { error: null, ok: false, duplicate: true };
  }

  return { error: null, ok: true, duplicate: false };
}

/** Cabut satu badge kustom dari anggota. */
export async function revokeAchievementAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const achievementId = String(formData.get("achievementId") ?? "");
  if (!achievementId) return;

  await db
    .delete(memberAchievements)
    .where(and(eq(memberAchievements.id, achievementId), eq(memberAchievements.type, "custom")));

  revalidateAchievementViews();
}

/** Jalankan ulang sinkronisasi badge otomatis (ACE, Pang-Tangguh, milestone, peran). */
export async function runAchievementSyncAction(): Promise<void> {
  await requireAdmin();
  await syncAchievements();
  revalidateAchievementViews();
}

/** Assign anggota sebagai EO sebuah event. */
export async function assignEventOrganizerAction(
  _prev: OrganizerFormState,
  formData: FormData,
): Promise<OrganizerFormState> {
  await requireAdmin();

  const parsed = eventOrganizerSchema.safeParse({
    eventId: formData.get("eventId"),
    memberId: formData.get("memberId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data EO tidak valid.", ok: false };
  }

  const [eventRow] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, parsed.data.eventId))
    .limit(1);
  if (!eventRow) return { error: "Event tidak ditemukan.", ok: false };

  const [member] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(eq(users.id, parsed.data.memberId), eq(users.role, "member"), eq(users.isActive, true)),
    )
    .limit(1);
  if (!member) return { error: "Anggota tidak ditemukan atau tidak aktif.", ok: false };

  await db
    .insert(eventOrganizers)
    .values({ eventId: eventRow.id, userId: member.id })
    .onConflictDoNothing();

  await syncRoleBadges();
  revalidateAchievementViews();
  return { error: null, ok: true };
}

/** Cabut status EO seorang anggota dari event. */
export async function removeEventOrganizerAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const organizerId = Number(formData.get("organizerId"));
  if (!Number.isInteger(organizerId)) return;

  await db.delete(eventOrganizers).where(eq(eventOrganizers.id, organizerId));
  await syncRoleBadges();
  revalidateAchievementViews();
}
