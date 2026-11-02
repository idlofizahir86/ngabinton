import type { Metadata } from "next";
import Link from "next/link";
import { Check, ImageIcon, Trash2, Video, X } from "lucide-react";

import { deleteSessionMediaAction, reviewSessionMediaAction } from "@/actions/session-media";
import {
  getMediaByStatus,
  getMediaStatusCounts,
  type SessionMediaItem,
  type SessionMediaStatus,
} from "@/lib/api/session-media";
import { requireAdmin } from "@/lib/auth/guards";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Media Mabar Seruu — Admin NGABINTON",
  robots: { index: false },
};

export const revalidate = 0;

const TABS: { status: SessionMediaStatus; label: string }[] = [
  { status: "approved", label: "Tayang" },
  { status: "pending", label: "Menunggu" },
  { status: "rejected", label: "Diturunkan" },
];

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

function resolveStatus(value: string | undefined): SessionMediaStatus {
  return value === "pending" || value === "rejected" ? value : "approved";
}

/** Moderasi media Mabar Seruu — hanya admin utama (RULES.md §19). */
export default async function AdminMediaPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const status = resolveStatus(params.status);

  const counts = await getMediaStatusCounts();
  const items = await getMediaByStatus(status);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl text-text md:text-4xl">Mabar Seruu</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          Foto &amp; video momen mabar yang diunggah anggota — <span className="font-semibold text-text">langsung tayang</span>{" "}
          begitu diunggah. Turunkan bila ada yang tidak pantas; tombol{" "}
          <span className="font-semibold text-text">Setujui</span> tetap tersedia bila
          media pernah diturunkan. Halaman publik:{" "}
          <Link
            href="/dokumentasi/mabar-seruu"
            className="text-primary underline-offset-4 hover:underline"
          >
            /dokumentasi/mabar-seruu
          </Link>
          .
        </p>
      </header>

      <nav aria-label="Filter status media" className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.status}
            href={`/admin/media?status=${tab.status}`}
            aria-current={status === tab.status ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-sm font-semibold transition",
              status === tab.status
                ? "bg-primary text-on-primary"
                : "border border-border text-text-muted hover:bg-surface-hover hover:text-text",
            )}
          >
            {tab.label}
            <span className="rounded-pill bg-background/30 px-1.5 text-xs tabular-nums">
              {counts[tab.status]}
            </span>
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
          Tidak ada media dengan status ini.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MediaCard({ item }: { item: SessionMediaItem }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <div className="relative aspect-[9/16] bg-background">
        {item.kind === "video" ? (
          <video
            src={item.url}
            poster={item.posterUrl ?? undefined}
            className="h-full w-full object-contain"
            controls
            preload="metadata"
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- media dinamis dari Supabase Storage
          <img
            src={item.url}
            alt={item.caption ?? "Momen mabar"}
            className="h-full w-full object-contain"
          />
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-pill bg-background/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.04em] text-text">
          {item.kind === "video" ? (
            <Video className="h-3 w-3" aria-hidden />
          ) : (
            <ImageIcon className="h-3 w-3" aria-hidden />
          )}
          {item.kind === "video" ? "Video" : "Foto"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm font-semibold text-text">{item.sessionTitle ?? "Tanpa sesi"}</p>
        <p className="text-xs text-text-muted">
          {item.uploaderName ?? "Anonim"} · {formatDateTime(item.createdAt)}
        </p>
        {item.caption ? <p className="text-sm text-text-secondary">{item.caption}</p> : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {item.status !== "approved" ? (
            <form action={reviewSessionMediaAction}>
              <input type="hidden" name="mediaId" value={item.id} />
              <input type="hidden" name="status" value="approved" />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-live/50 bg-live/10 px-3 py-1.5 text-xs font-semibold text-live transition hover:bg-live/20"
              >
                <Check className="h-3.5 w-3.5" aria-hidden />
                Setujui
              </button>
            </form>
          ) : null}

          {item.status !== "rejected" ? (
            <form action={reviewSessionMediaAction}>
              <input type="hidden" name="mediaId" value={item.id} />
              <input type="hidden" name="status" value="rejected" />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:bg-surface-hover hover:text-text"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                {item.status === "approved" ? "Turunkan" : "Tolak"}
              </button>
            </form>
          ) : null}

          <form action={deleteSessionMediaAction}>
            <input type="hidden" name="mediaId" value={item.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md border border-danger/50 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Hapus
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
