"use client";

/**
 * Player "Mabar Seruu" bergaya stories (DESIGN.md §7.24).
 * Foto tampil 5 detik, video diputar sampai habis; progress bar di atas,
 * tap kiri/kanan untuk pindah, tap tengah untuk jeda.
 */
import Link from "next/link";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

const PHOTO_DURATION_MS = 5000;

export type StoryMediaItem = {
  id: string;
  kind: "photo" | "video";
  url: string;
  posterUrl: string | null;
  caption: string | null;
  uploaderName: string | null;
};

export type StoryGroup = {
  sessionId: string | null;
  title: string;
  playedAtLabel: string | null;
  itemCount: number;
  items: StoryMediaItem[];
};

export type StoryPlayerProps = {
  groups: StoryGroup[];
};

/** Player cerita: satu grup = satu sesi mabar. */
export function StoryPlayer({ groups }: StoryPlayerProps) {
  const [groupIndex, setGroupIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [finished, setFinished] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const group = groups[groupIndex];
  const item = group?.items[itemIndex];

  const goTo = useCallback((nextGroup: number, nextItem: number) => {
    setGroupIndex(nextGroup);
    setItemIndex(nextItem);
    setFinished(false);
    setPaused(false);
    setVideoProgress(0);
  }, []);

  const goNext = useCallback(() => {
    if (!group) return;
    if (itemIndex + 1 < group.items.length) {
      setItemIndex(itemIndex + 1);
      setVideoProgress(0);
      setPaused(false);
      return;
    }
    if (groupIndex + 1 < groups.length) {
      goTo(groupIndex + 1, 0);
      return;
    }
    setFinished(true);
  }, [group, groupIndex, groups.length, itemIndex, goTo]);

  const goPrev = useCallback(() => {
    if (!group) return;
    if (itemIndex > 0) {
      setItemIndex(itemIndex - 1);
      setVideoProgress(0);
      setPaused(false);
      return;
    }
    if (groupIndex > 0) {
      goTo(groupIndex - 1, groups[groupIndex - 1].items.length - 1);
    }
  }, [group, groupIndex, groups, itemIndex, goTo]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === " " || event.key === "k") {
        event.preventDefault();
        setPaused((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
    } else {
      void video.play().catch(() => setPaused(true));
    }
  }, [paused, item?.id]);

  // Saat `prefers-reduced-motion`, animasi progress dimatikan sehingga
  // perpindahan foto memakai timer biasa (bukan animationend).
  useEffect(() => {
    if (!reducedMotion || !item || item.kind !== "photo" || paused || finished) return;
    const timer = window.setTimeout(goNext, PHOTO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, item, paused, finished, goNext]);

  if (!group || !item) return null;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-xl border border-border bg-background shadow-card aspect-[9/16]">
        {item.kind === "video" ? (
          <video
            key={item.id}
            ref={videoRef}
            src={item.url}
            poster={item.posterUrl ?? undefined}
            className="h-full w-full object-contain"
            playsInline
            autoPlay
            muted={muted}
            onTimeUpdate={(event) => {
              const media = event.currentTarget;
              const total = media.duration || 1;
              setVideoProgress(Math.min(100, (media.currentTime / total) * 100));
            }}
            onEnded={goNext}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- media dinamis dari Supabase Storage
          <img
            key={item.id}
            src={item.url}
            alt={item.caption ?? `Momen ${group.title}`}
            className="h-full w-full object-contain"
          />
        )}

        {/* Progress bar */}
        <div className="absolute inset-x-3 top-3 flex gap-1">
          {group.items.map((story, index) => (
            <div
              key={story.id}
              className="h-0.5 flex-1 overflow-hidden rounded-pill bg-text/25"
            >
              <div
                className="h-full rounded-pill bg-text"
                style={
                  index < itemIndex
                    ? { width: "100%" }
                    : index > itemIndex
                      ? { width: 0 }
                      : story.kind === "video"
                        ? { width: `${videoProgress}%` }
                        : reducedMotion
                          ? { width: "100%" }
                          : {
                              width: "100%",
                              animation: `ngabinton-story-progress ${PHOTO_DURATION_MS}ms linear forwards`,
                              animationPlayState: paused ? "paused" : "running",
                            }
                }
                onAnimationEnd={
                  story.kind === "photo" && !reducedMotion ? goNext : undefined
                }
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute inset-x-3 top-7 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{group.title}</p>
            <p className="text-[11px] text-text-muted">
              {[group.playedAtLabel, item.uploaderName].filter(Boolean).join(" · ") ||
                "Mabar Ngabinton"}
            </p>
          </div>
          {item.kind === "video" ? (
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-background/60 text-text transition hover:bg-background/80"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          ) : null}
        </div>

        {/* Zona tap */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Momen sebelumnya"
          className="absolute inset-y-0 left-0 w-1/3 cursor-default"
        />
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "Lanjutkan" : "Jeda"}
          className="absolute inset-y-0 left-1/3 w-1/3 cursor-default"
        />
        <button
          type="button"
          onClick={goNext}
          aria-label="Momen berikutnya"
          className="absolute inset-y-0 right-0 w-1/3 cursor-default"
        />

        {paused && !finished ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-pill bg-background/70 text-text">
              <Play className="h-6 w-6" aria-hidden />
            </span>
          </span>
        ) : null}

        {/* Caption */}
        {item.caption ? (
          <p className="absolute inset-x-3 bottom-3 rounded-md bg-background/70 px-3 py-2 text-sm text-text">
            {item.caption}
          </p>
        ) : null}

        {finished ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 px-6 text-center">
            <p className="font-display text-xl text-text">Semua momen sudah ditonton</p>
            <button
              type="button"
              onClick={() => goTo(0, 0)}
              className="inline-flex items-center gap-2 rounded-pill bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Putar ulang
            </button>
            <Link href="/dokumentasi/mabar-seruu/unggah" className="text-sm text-text-secondary underline">
              Tambah momen mabar
            </Link>
          </div>
        ) : null}
      </div>

      <div className="flex w-full max-w-[380px] items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          Sesi {groupIndex + 1} dari {groups.length} · {itemIndex + 1}/{group.items.length}
        </p>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          className={cn(
            "inline-flex items-center gap-2 rounded-pill border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:bg-surface-hover hover:text-text",
            finished && "invisible",
          )}
        >
          {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
          {paused ? "Lanjutkan" : "Jeda"}
        </button>
      </div>

      {groups.length > 1 ? (
        <div className="flex w-full max-w-[380px] gap-2 overflow-x-auto pb-1">
          {groups.map((option, index) => (
            <button
              key={option.sessionId ?? `grup-${index}`}
              type="button"
              onClick={() => goTo(index, 0)}
              aria-current={index === groupIndex ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-pill border px-3 py-1.5 text-xs font-semibold transition",
                index === groupIndex
                  ? "border-primary bg-primary/15 text-text"
                  : "border-border text-text-muted hover:bg-surface-hover hover:text-text",
              )}
            >
              {option.title} · {option.itemCount}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
