/**
 * Perhitungan EXP permainan (RULES.md §13).
 *
 * Aturan: **per set** — sisi yang menang dapat `EXP_WIN_PER_SET`, yang kalah
 * tetap dapat `EXP_LOSS_PER_SET`. Total EXP anggota = jumlah EXP seluruh set
 * yang ia mainkan di semua game.
 *
 * Sumber kebenaran EXP adalah tabel permainan (`match_participants` + `match_sets`).
 * Kolom `users.exp` hanyalah cache; di-`recompute` setiap kali ada perubahan game.
 */
import { sql } from "drizzle-orm";

import { EXP_LOSS_PER_SET, EXP_WIN_PER_SET, type MatchSide } from "@/lib/constants";
import { db } from "@/lib/db/client";
import { matchParticipants, matchSets, users } from "@/lib/db/schema";
import type { MatchSet } from "@/lib/types/member";

/** EXP satu sisi untuk satu set. */
export function expForSide(set: Pick<MatchSet, "scoreA" | "scoreB">, side: MatchSide): number {
  const won = side === "a" ? set.scoreA > set.scoreB : set.scoreB > set.scoreA;
  return won ? EXP_WIN_PER_SET : EXP_LOSS_PER_SET;
}

export type SetsSummary = {
  totalSets: number;
  winsA: number;
  winsB: number;
  expA: number;
  expB: number;
};

/** Ringkasan skor & EXP dari daftar set. */
export function summarizeSets(sets: Pick<MatchSet, "scoreA" | "scoreB">[]): SetsSummary {
  return sets.reduce<SetsSummary>(
    (acc, set) => {
      const aWon = set.scoreA > set.scoreB;
      acc.totalSets += 1;
      acc.winsA += aWon ? 1 : 0;
      acc.winsB += aWon ? 0 : 1;
      acc.expA += expForSide(set, "a");
      acc.expB += expForSide(set, "b");
      return acc;
    },
    { totalSets: 0, winsA: 0, winsB: 0, expA: 0, expB: 0 },
  );
}

/** Bangun daftar id untuk klausa `IN` (aman, via parameter terikat). */
function idList(ids: number[]) {
  return sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `,
  );
}

/** Hitung ulang `users.exp` dari data permainan untuk sekumpulan user. */
export async function recomputeExpForUsers(userIds: number[]): Promise<void> {
  const unique = [...new Set(userIds)].filter((id) => Number.isInteger(id) && id > 0);
  if (unique.length === 0) return;

  await db.execute(sql`
    update ${users}
    set exp = coalesce((
      select sum(case
        when (${matchParticipants.side} = 'a' and ${matchSets.scoreA} > ${matchSets.scoreB})
          or (${matchParticipants.side} = 'b' and ${matchSets.scoreB} > ${matchSets.scoreA})
        then ${EXP_WIN_PER_SET}::int else ${EXP_LOSS_PER_SET}::int end)
      from ${matchParticipants}
      join ${matchSets} on ${matchSets.matchId} = ${matchParticipants.matchId}
      where ${matchParticipants.userId} = ${users.id}
    ), 0),
    updated_at = now()
    where ${users.id} in (${idList(unique)})
  `);
}

/** Hitung ulang EXP semua anggota club (dipakai saat seed / perbaikan data). */
export async function recomputeAllMemberExp(): Promise<void> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`${users.role} = 'member'`);
  await recomputeExpForUsers(rows.map((row) => row.id));
}
