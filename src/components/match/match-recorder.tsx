"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { recordMatchAction } from "@/actions/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MemberOption } from "@/lib/api/matches";
import { MAX_SETS_PER_MATCH, MAX_SET_SCORE } from "@/lib/constants";
import { INITIAL_MATCH_STATE } from "@/lib/forms/states";
import { cn } from "@/lib/utils/cn";

type Row = { id: string; kind: "member" | "guest"; userId: string; guestName: string };
type SetRow = { id: string; scoreA: string; scoreB: string };

let sequence = 0;
function uid(): string {
  sequence += 1;
  return `row-${Date.now()}-${sequence}`;
}

function emptyRow(): Row {
  return { id: uid(), kind: "member", userId: "", guestName: "" };
}

function emptySet(): SetRow {
  return { id: uid(), scoreA: "", scoreB: "" };
}

function toPayload(row: Row) {
  return row.kind === "member"
    ? { kind: "member" as const, userId: row.userId ? Number(row.userId) : null }
    : { kind: "guest" as const, guestName: row.guestName.trim() };
}

export type MatchRecorderProps = {
  sessionId: string;
  members: MemberOption[];
};

/** Form pencatatan satu game: 2 tim (1–N pemain) & 1–N set. */
export function MatchRecorder({ sessionId, members }: MatchRecorderProps) {
  const [state, formAction, isPending] = useActionState(recordMatchAction, INITIAL_MATCH_STATE);
  const [sideA, setSideA] = useState<Row[]>([emptyRow()]);
  const [sideB, setSideB] = useState<Row[]>([emptyRow()]);
  const [sets, setSets] = useState<SetRow[]>([emptySet()]);
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (state.ok) {
      setSideA([emptyRow()]);
      setSideB([emptyRow()]);
      setSets([emptySet()]);
      setLabel("");
      setNotes("");
    }
  }, [state.ok]);

  const payload = JSON.stringify({
    sessionId,
    label: label.trim() || null,
    notes: notes.trim() || null,
    sideA: sideA.map(toPayload),
    sideB: sideB.map(toPayload),
    sets: sets.map((set) => ({ scoreA: Number(set.scoreA), scoreB: Number(set.scoreB) })),
  });

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="payload" value={payload} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="label">Nama Game (opsional)</Label>
          <Input
            id="label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Game 1"
            maxLength={60}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Catatan (opsional)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={200}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TeamEditor title="Tim A" rows={sideA} setRows={setSideA} members={members} />
        <TeamEditor title="Tim B" rows={sideB} setRows={setSideB} members={members} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Skor per Set</Label>
          {sets.length < MAX_SETS_PER_MATCH ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setSets([...sets, emptySet()])}>
              <Plus className="h-4 w-4" /> Set
            </Button>
          ) : null}
        </div>
        {sets.map((set, index) => (
          <div key={set.id} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-sm text-text-muted">Set {index + 1}</span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_SET_SCORE}
              value={set.scoreA}
              onChange={(event) => updateSet(sets, setSets, set.id, { scoreA: event.target.value })}
              aria-label={`Skor Tim A set ${index + 1}`}
              required
            />
            <span className="text-text-subtle">–</span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_SET_SCORE}
              value={set.scoreB}
              onChange={(event) => updateSet(sets, setSets, set.id, { scoreB: event.target.value })}
              aria-label={`Skor Tim B set ${index + 1}`}
              required
            />
            {sets.length > 1 ? (
              <button
                type="button"
                onClick={() => setSets(sets.filter((item) => item.id !== set.id))}
                aria-label={`Hapus set ${index + 1}`}
                className="text-text-muted transition hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-live">
          Game tersimpan. Lanjut isi game berikutnya.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Menyimpan..." : "Simpan Game"}
      </Button>
    </form>
  );
}

function updateSet(
  sets: SetRow[],
  setSets: (next: SetRow[]) => void,
  id: string,
  patch: Partial<SetRow>,
) {
  setSets(sets.map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

function TeamEditor({
  title,
  rows,
  setRows,
  members,
}: {
  title: string;
  rows: Row[];
  setRows: (next: Row[]) => void;
  members: MemberOption[];
}) {
  const patch = (id: string, next: Partial<Row>) =>
    setRows(rows.map((row) => (row.id === id ? { ...row, ...next } : row)));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-text">{title}</p>
        {rows.length < 6 ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => setRows([...rows, emptyRow()])}>
            <Plus className="h-4 w-4" /> Pemain
          </Button>
        ) : null}
      </div>

      {rows.map((row) => (
        <div key={row.id} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <select
              value={row.kind === "member" ? `m-${row.userId}` : "g"}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "g") {
                  patch(row.id, { kind: "guest", userId: "" });
                } else {
                  patch(row.id, { kind: "member", userId: value.slice(2) });
                }
              }}
              className={cn(
                "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text",
                "focus:border-primary focus:outline-none focus:shadow-focus",
              )}
              aria-label={`Pemain ${title}`}
            >
              <option value="m-">— Pilih anggota —</option>
              <option value="g">Tamu (bukan anggota)</option>
              {members.map((member) => (
                <option key={member.id} value={`m-${member.id}`}>
                  {member.nickname ? `${member.nickname} (${member.displayName})` : member.displayName}
                </option>
              ))}
            </select>
            {rows.length > 1 ? (
              <button
                type="button"
                onClick={() => setRows(rows.filter((item) => item.id !== row.id))}
                aria-label="Hapus pemain"
                className="text-text-muted transition hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          {row.kind === "guest" ? (
            <Input
              value={row.guestName}
              onChange={(event) => patch(row.id, { guestName: event.target.value })}
              placeholder="Nama tamu"
              maxLength={40}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
