"use server";

/**
 * Server Action pencatatan keuangan (RULES.md §16).
 * Hanya user dengan menu `finance` atau pengurus yang boleh menulis.
 */
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireMenu } from "@/lib/auth/guards";
import { guestAttendanceKey } from "@/lib/api/matches";
import type { FinancePaymentMethod } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { financeEntries, financeTransfers, playSessions, users } from "@/lib/db/schema";
import type {
  BulkDuesState,
  FinanceFormState,
  FinanceTransferState,
} from "@/lib/forms/states";
import { parseJakartaLocal } from "@/lib/utils/jakarta";
import {
  bulkSessionDuesSchema,
  financeEntrySchema,
  financeTransferSchema,
} from "@/lib/validators/finance";

function revalidateFinance(sessionId?: string | null) {
  // Tag dipakai `unstable_cache` (saldo & daftar bulan), path untuk RSC.
  revalidateTag("finance");
  revalidatePath("/admin/keuangan");
  revalidatePath("/member/keuangan");
  revalidatePath("/member");
  if (sessionId) revalidatePath(`/admin/sesi/${sessionId}`);
}

type ParsedEntry = {
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  paymentMethod: FinancePaymentMethod;
  payerUserId: number | null;
  occurredAt: Date;
  playSessionId: string | null;
};

function parseForm(formData: FormData): { error: string } | { data: ParsedEntry } {
  const parsed = financeEntrySchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    category: formData.get("category"),
    occurredAt: formData.get("occurredAt"),
    playSessionId: formData.get("playSessionId") ?? "",
    paymentMethod: formData.get("paymentMethod") ?? "cash",
    payerUserId: formData.get("payerUserId") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid." };
  }

  const occurredAt = parseJakartaLocal(parsed.data.occurredAt);
  if (!occurredAt) {
    return { error: "Tanggal transaksi tidak valid." };
  }

  return {
    data: {
      type: parsed.data.type,
      amount: parsed.data.amount,
      description: parsed.data.description,
      category: parsed.data.category,
      paymentMethod: parsed.data.paymentMethod,
      payerUserId: parsed.data.payerUserId ? Number(parsed.data.payerUserId) : null,
      occurredAt,
      playSessionId: parsed.data.playSessionId,
    },
  };
}

async function sessionExists(id: string): Promise<boolean> {
  const rows = await db
    .select({ id: playSessions.id })
    .from(playSessions)
    .where(eq(playSessions.id, id))
    .limit(1);
  return rows.length > 0;
}

/** Pastikan anggota pembayar valid & aktif. */
async function memberExists(id: number): Promise<boolean> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, "member"), eq(users.isActive, true)))
    .limit(1);
  return rows.length > 0;
}

/** Catat transaksi baru. */
export async function createFinanceEntryAction(
  _prev: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  const session = await requireMenu("finance");
  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error, ok: false };

  if (parsed.data.playSessionId && !(await sessionExists(parsed.data.playSessionId))) {
    return { error: "Sesi tidak ditemukan.", ok: false };
  }
  if (parsed.data.payerUserId && !(await memberExists(parsed.data.payerUserId))) {
    return { error: "Anggota pembayar tidak ditemukan atau tidak aktif.", ok: false };
  }

  const createdBy = Number(session.sub);

  await db.insert(financeEntries).values({
    ...parsed.data,
    createdBy: Number.isInteger(createdBy) ? createdBy : null,
  });

  revalidateFinance(parsed.data.playSessionId);
  return { error: null, ok: true };
}

/** Ubah transaksi yang sudah ada. */
export async function updateFinanceEntryAction(
  _prev: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  await requireMenu("finance");

  const entryId = String(formData.get("entryId") ?? "");
  if (!entryId) return { error: "Transaksi tidak valid.", ok: false };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error, ok: false };

  if (parsed.data.playSessionId && !(await sessionExists(parsed.data.playSessionId))) {
    return { error: "Sesi tidak ditemukan.", ok: false };
  }
  if (parsed.data.payerUserId && !(await memberExists(parsed.data.payerUserId))) {
    return { error: "Anggota pembayar tidak ditemukan atau tidak aktif.", ok: false };
  }

  const existing = await db
    .select({ sessionId: financeEntries.playSessionId })
    .from(financeEntries)
    .where(eq(financeEntries.id, entryId))
    .limit(1);

  if (existing.length === 0) {
    return { error: "Transaksi tidak ditemukan.", ok: false };
  }

  await db
    .update(financeEntries)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(financeEntries.id, entryId));

  revalidateFinance(existing[0]?.sessionId);
  revalidateFinance(parsed.data.playSessionId);
  redirect("/admin/keuangan");
}

/** Hapus transaksi. */
export async function deleteFinanceEntryAction(formData: FormData): Promise<void> {
  await requireMenu("finance");

  const entryId = String(formData.get("entryId") ?? "");
  if (!entryId) return;

  const existing = await db
    .select({ sessionId: financeEntries.playSessionId })
    .from(financeEntries)
    .where(eq(financeEntries.id, entryId))
    .limit(1);

  await db.delete(financeEntries).where(eq(financeEntries.id, entryId));
  revalidateFinance(existing[0]?.sessionId);
}

/** Pindahkan dana antara Cash dan Rekening Bank (tidak mengubah total saldo). */
export async function createFinanceTransferAction(
  _prev: FinanceTransferState,
  formData: FormData,
): Promise<FinanceTransferState> {
  const authSession = await requireMenu("finance");

  const parsed = financeTransferSchema.safeParse({
    fromMethod: formData.get("fromMethod") ?? "cash",
    toMethod: formData.get("toMethod") ?? "transfer",
    amount: formData.get("amount"),
    description: formData.get("description"),
    occurredAt: formData.get("occurredAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data pindah dana tidak valid.", ok: false };
  }

  const occurredAt = parseJakartaLocal(parsed.data.occurredAt);
  if (!occurredAt) {
    return { error: "Tanggal transaksi tidak valid.", ok: false };
  }

  const createdBy = Number(authSession.sub);

  await db.insert(financeTransfers).values({
    fromMethod: parsed.data.fromMethod,
    toMethod: parsed.data.toMethod,
    amount: parsed.data.amount,
    description: parsed.data.description,
    occurredAt,
    createdBy: Number.isInteger(createdBy) ? createdBy : null,
  });

  revalidateFinance();
  return { error: null, ok: true };
}

/** Hapus catatan pindah dana. */
export async function deleteFinanceTransferAction(formData: FormData): Promise<void> {
  await requireMenu("finance");

  const transferId = String(formData.get("transferId") ?? "");
  if (!transferId) return;

  await db.delete(financeTransfers).where(eq(financeTransfers.id, transferId));
  revalidateFinance();
}

/**
 * Catat iuran sesi untuk banyak anggota/BaturanNgabinton sekaligus.
 * Pembayar yang sudah punya iuran di sesi yang sama dilewati (idempotent).
 */
export async function createBulkSessionDuesAction(
  _prev: BulkDuesState,
  formData: FormData,
): Promise<BulkDuesState> {
  const authSession = await requireMenu("finance");

  const parsed = bulkSessionDuesSchema.safeParse({
    sessionId: formData.get("sessionId"),
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod") ?? "cash",
    occurredAt: formData.get("occurredAt"),
    memberIds: formData.getAll("memberIds"),
    guestNames: formData.getAll("guestNames"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data iuran tidak valid.",
      ok: false,
      created: 0,
      skipped: 0,
    };
  }

  const occurredAt = parseJakartaLocal(parsed.data.occurredAt);
  if (!occurredAt) {
    return { error: "Tanggal transaksi tidak valid.", ok: false, created: 0, skipped: 0 };
  }

  const playSession = await db
    .select({ id: playSessions.id, title: playSessions.title })
    .from(playSessions)
    .where(eq(playSessions.id, parsed.data.sessionId))
    .limit(1);

  const sessionRow = playSession[0];
  if (!sessionRow) {
    return { error: "Sesi tidak ditemukan.", ok: false, created: 0, skipped: 0 };
  }

  const memberRows =
    parsed.data.memberIds.length > 0
      ? await db
          .select({ id: users.id })
          .from(users)
          .where(
            and(
              inArray(users.id, parsed.data.memberIds),
              eq(users.role, "member"),
              eq(users.isActive, true),
            ),
          )
      : [];

  const guestNames = [
    ...new Map(
      parsed.data.guestNames.map((name) => [guestAttendanceKey(name), name] as const),
    ).values(),
  ];

  if (memberRows.length === 0 && guestNames.length === 0) {
    return {
      error: "Tidak ada anggota aktif atau BaturanNgabinton yang valid.",
      ok: false,
      created: 0,
      skipped: 0,
    };
  }

  const existing = await db
    .select({
      payerUserId: financeEntries.payerUserId,
      payerGuestName: financeEntries.payerGuestName,
    })
    .from(financeEntries)
    .where(
      and(
        eq(financeEntries.playSessionId, sessionRow.id),
        eq(financeEntries.type, "income"),
        eq(financeEntries.category, "iuran_sesi"),
      ),
    );

  const paidMemberIds = new Set<number>();
  const paidGuestKeys = new Set<string>();
  for (const row of existing) {
    if (row.payerUserId !== null) paidMemberIds.add(row.payerUserId);
    if (row.payerGuestName) paidGuestKeys.add(guestAttendanceKey(row.payerGuestName));
  }

  const memberTargets = memberRows.filter((row) => !paidMemberIds.has(row.id));
  const guestTargets = guestNames.filter((name) => !paidGuestKeys.has(guestAttendanceKey(name)));
  const skipped = memberRows.length - memberTargets.length + (guestNames.length - guestTargets.length);

  if (memberTargets.length === 0 && guestTargets.length === 0) {
    return {
      error: null,
      ok: true,
      created: 0,
      skipped,
    };
  }

  const createdBy = Number(authSession.sub);
  const description = parsed.data.description ?? `Iuran ${sessionRow.title}`;

  await db.insert(financeEntries).values([
    ...memberTargets.map((row) => ({
      type: "income" as const,
      amount: parsed.data.amount,
      description,
      category: "iuran_sesi",
      paymentMethod: parsed.data.paymentMethod,
      payerUserId: row.id,
      playSessionId: sessionRow.id,
      occurredAt,
      createdBy: Number.isInteger(createdBy) ? createdBy : null,
    })),
    ...guestTargets.map((name) => ({
      type: "income" as const,
      amount: parsed.data.amount,
      description,
      category: "iuran_sesi",
      paymentMethod: parsed.data.paymentMethod,
      payerGuestName: name,
      playSessionId: sessionRow.id,
      occurredAt,
      createdBy: Number.isInteger(createdBy) ? createdBy : null,
    })),
  ]);

  revalidateFinance(sessionRow.id);
  return {
    error: null,
    ok: true,
    created: memberTargets.length + guestTargets.length,
    skipped,
  };
}
