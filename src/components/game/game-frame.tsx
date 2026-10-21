"use client";

import { Maximize2 } from "lucide-react";
import { useRef } from "react";

import { cn } from "@/lib/utils/cn";

export type GameFrameProps = {
  src: string;
  title: string;
  className?: string;
};

/**
 * Bingkai game (iframe aset statis). Rasio 2:3 mengikuti canvas 480×720,
 * dan tinggi dibatasi viewport supaya tidak perlu scroll di ponsel.
 */
export function GameFrame({ src, title, className }: GameFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  async function enterFullscreen() {
    if (!frameRef.current?.requestFullscreen) return;
    try {
      await frameRef.current.requestFullscreen();
    } catch {
      /* Peramban menolak (mis. iOS Safari) — tetap bisa dimainkan inline. */
    }
  }

  return (
    <div
      className={cn("mx-auto w-full", className)}
      style={{ maxWidth: "min(460px, calc((100dvh - 9rem) * 2 / 3))" }}
    >
      <div
        ref={frameRef}
        className="ngbt-game-screen relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-border bg-black shadow-card"
      >
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-text-subtle">
          Ketuk layar atau gunakan tombol di dalam game.
        </p>
        <button
          type="button"
          onClick={enterFullscreen}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:shadow-focus"
        >
          <Maximize2 aria-hidden className="h-3.5 w-3.5" />
          Layar penuh
        </button>
      </div>
    </div>
  );
}
