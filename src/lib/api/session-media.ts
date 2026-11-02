/**
 * Query media "Mabar Seruu" — RULES.md §19.
 *
 * Media masuk sebagai `pending`; hanya `approved` yang tampil publik.
 */
import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { playSessions, sessionMedia, users } from "@/lib/db/schema";
import { mediaPublicUrl } from "@/lib/supabase/media";

export type SessionMediaKind = "photo" | "video";
export type SessionMediaStatus = "pending" | "approved" | "rejected";

export type SessionMediaItem = {
  id: string;
  kind: SessionMediaKind;
  url: string;
  posterUrl: string | null;
  caption: string | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  status: SessionMediaStatus;
  createdAt: Date;
  sessionId: string | null;
  sessionTitle: string | null;
  sessionPlayedAt: Date | null;
  uploaderName: string | null;
};

/** Satu "kartu stories": sesi + urutan medianya. */
export type SessionMediaGroup = {
  sessionId: string | null;
  title: string;
  playedAt: Date | null;
  items: SessionMediaItem[];
};

const SELECTED_COLUMNS = {
  id: sessionMedia.id,
  kind: sessionMedia.kind,
  storagePath: sessionMedia.storagePath,
  posterPath: sessionMedia.posterPath,
  caption: sessionMedia.caption,
  durationSeconds: sessionMedia.durationSeconds,
  width: sessionMedia.width,
  height: sessionMedia.height,
  status: sessionMedia.status,
  createdAt: sessionMedia.createdAt,
  sessionId: sessionMedia.sessionId,
  sessionTitle: playSessions.title,
  sessionPlayedAt: playSessions.playedAt,
  uploaderNickname: users.nickname,
  uploaderDisplayName: users.displayName,
};

type SelectedRow = {
  id: string;
  kind: SessionMediaKind;
  storagePath: string;
  posterPath: string | null;
  caption: string | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  status: SessionMediaStatus;
  createdAt: Date;
  sessionId: string | null;
  sessionTitle: string | null;
  sessionPlayedAt: Date | null;
  uploaderNickname: string | null;
  uploaderDisplayName: string | null;
};

function toItem(row: SelectedRow): SessionMediaItem {
  return {
    id: row.id,
    kind: row.kind,
    url: mediaPublicUrl(row.storagePath),
    posterUrl: row.posterPath ? mediaPublicUrl(row.posterPath) : null,
    caption: row.caption,
    durationSeconds: row.durationSeconds,
    width: row.width,
    height: row.height,
    status: row.status,
    createdAt: row.createdAt,
    sessionId: row.sessionId,
    sessionTitle: row.sessionTitle,
    sessionPlayedAt: row.sessionPlayedAt,
    uploaderName: row.uploaderNickname ?? row.uploaderDisplayName ?? null,
  };
}

/** Semua media `approved`, dikelompokkan per sesi (sesi terbaru dulu). */
export async function getApprovedStoryGroups(): Promise<SessionMediaGroup[]> {
  const rows: SelectedRow[] = await db
    .select(SELECTED_COLUMNS)
    .from(sessionMedia)
    .leftJoin(playSessions, eq(playSessions.id, sessionMedia.sessionId))
    .leftJoin(users, eq(users.id, sessionMedia.uploaderUserId))
    .where(eq(sessionMedia.status, "approved"))
    .orderBy(
      sql`${playSessions.playedAt} desc nulls last`,
      desc(sessionMedia.createdAt),
    );

  const groups = new Map<string, SessionMediaGroup>();
  for (const row of rows) {
    const key = row.sessionId ?? "tanpa-sesi";
    const group = groups.get(key) ?? {
      sessionId: row.sessionId,
      title: row.sessionTitle ?? "Mabar Seruu",
      playedAt: row.sessionPlayedAt,
      items: [],
    };
    group.items.push(toItem(row));
    groups.set(key, group);
  }

  // Di dalam satu sesi, urutan cerita dibalik jadi kronologis (lama → baru).
  for (const group of groups.values()) {
    group.items.reverse();
  }

  return [...groups.values()];
}

/** Media untuk panel moderasi admin utama. */
export async function getMediaByStatus(status: SessionMediaStatus): Promise<SessionMediaItem[]> {
  const rows: SelectedRow[] = await db
    .select(SELECTED_COLUMNS)
    .from(sessionMedia)
    .leftJoin(playSessions, eq(playSessions.id, sessionMedia.sessionId))
    .leftJoin(users, eq(users.id, sessionMedia.uploaderUserId))
    .where(eq(sessionMedia.status, status))
    .orderBy(desc(sessionMedia.createdAt));

  return rows.map(toItem);
}

/** Jumlah media per status (untuk badge tab admin). */
export async function getMediaStatusCounts(): Promise<Record<SessionMediaStatus, number>> {
  const rows = await db
    .select({ status: sessionMedia.status, total: sql<number>`count(*)::int` })
    .from(sessionMedia)
    .groupBy(sessionMedia.status);

  const counts: Record<SessionMediaStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const row of rows) {
    counts[row.status] = row.total;
  }
  return counts;
}

/** Sesi terakhir untuk pilihan "momen mabar mana" saat mengunggah. */
export async function getRecentSessionOptions(
  limit = 20,
): Promise<{ id: string; title: string; playedAt: Date }[]> {
  return db
    .select({ id: playSessions.id, title: playSessions.title, playedAt: playSessions.playedAt })
    .from(playSessions)
    .orderBy(desc(playSessions.playedAt))
    .limit(limit);
}

export type NewSessionMedia = {
  sessionId: string | null;
  uploaderUserId: number;
  kind: SessionMediaKind;
  storagePath: string;
  posterPath: string | null;
  caption: string | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
};

/** Simpan media baru — selalu masuk sebagai `pending` (menunggu admin utama). */
export async function createSessionMedia(input: NewSessionMedia): Promise<string> {
  const rows = await db
    .insert(sessionMedia)
    .values({ ...input, status: "pending" })
    .returning({ id: sessionMedia.id });
  const id = rows[0]?.id;
  if (!id) {
    throw new Error("Gagal menyimpan media.");
  }
  return id;
}

/** Tetapkan status moderasi (admin utama). */
export async function reviewSessionMedia(input: {
  mediaId: string;
  status: Extract<SessionMediaStatus, "approved" | "rejected">;
  reviewerUserId: number;
  note: string | null;
}): Promise<boolean> {
  const rows = await db
    .update(sessionMedia)
    .set({
      status: input.status,
      reviewedByUserId: input.reviewerUserId,
      reviewedAt: new Date(),
      reviewNote: input.note,
    })
    .where(eq(sessionMedia.id, input.mediaId))
    .returning({ id: sessionMedia.id });
  return rows.length > 0;
}

/** Hapus media (admin utama) — objek storage ikut dibersihkan oleh pemanggil. */
export async function deleteSessionMedia(mediaId: string): Promise<{ storagePath: string; posterPath: string | null } | null> {
  const rows = await db
    .delete(sessionMedia)
    .where(eq(sessionMedia.id, mediaId))
    .returning({ storagePath: sessionMedia.storagePath, posterPath: sessionMedia.posterPath });
  return rows[0] ?? null;
}
