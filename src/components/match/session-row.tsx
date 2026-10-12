import Link from "next/link";

import { formatDateTime } from "@/lib/utils/format";

/** Data minimum untuk menampilkan satu baris sesi mabar. */
export type SessionListItem = {
  id: string;
  title: string;
  location: string | null;
  playedAt: Date;
  matchCount: number;
};

/** Satu sesi mabar dalam daftar: judul, jadwal, lokasi, dan jumlah game. */
export function SessionRow({ session }: { session: SessionListItem }) {
  return (
    <li>
      <Link
        href={`/sesi/${session.id}`}
        className="block h-full rounded-lg border border-border bg-surface p-4 transition hover:bg-surface-hover"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-text">{session.title}</p>
          <span className="shrink-0 rounded-pill bg-surface-hover px-3 py-1 text-xs text-text-muted">
            {session.matchCount} game
          </span>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          {formatDateTime(session.playedAt)}
          {session.location ? ` · ${session.location}` : ""}
        </p>
      </Link>
    </li>
  );
}
