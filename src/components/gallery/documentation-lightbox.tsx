"use client";

/**
 * Lightbox galeri Arsip Dokumentasi (DESIGN.md §7.25).
 * Tanpa dependency: overlay + Escape + panah kiri/kanan + scroll lock,
 * mengikuti pola `<Sheet />` (COMPONENTS.md §7.1).
 */
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { PhotoItem } from "@/components/gallery/documentation-gallery";
import { cn } from "@/lib/utils/cn";

export type DocumentationLightboxProps = {
  photos: PhotoItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function DocumentationLightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: DocumentationLightboxProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const photo = photos[index];
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrev) onNavigate(index - 1);
      if (event.key === "ArrowRight" && hasNext) onNavigate(index + 1);
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [hasNext, hasPrev, index, onClose, onNavigate]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-background/85"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-background-elevated shadow-elevated">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{photo.title}</p>
            <p className="text-xs text-text-muted">
              {[photo.date, `${index + 1} / ${photos.length}`].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup pratinjau"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border border-border text-text-muted transition hover:bg-surface-hover hover:text-text"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-background p-2 sm:p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- gambar dinamis dari proxy Drive */}
          <img
            src={`/api/dokumentasi/${photo.id}`}
            alt={photo.title}
            className="max-h-[74vh] w-auto max-w-full object-contain"
          />

          <NavButton
            side="left"
            disabled={!hasPrev}
            onClick={() => onNavigate(index - 1)}
            label="Foto sebelumnya"
          />
          <NavButton
            side="right"
            disabled={!hasNext}
            onClick={() => onNavigate(index + 1)}
            label="Foto berikutnya"
          />
        </div>
      </div>
    </div>
  );
}

function NavButton({
  side,
  disabled,
  onClick,
  label,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "absolute top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-pill border border-border bg-background/70 text-text transition hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-30",
        side === "left" ? "left-2 sm:left-3" : "right-2 sm:right-3",
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  );
}
