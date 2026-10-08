"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils/cn";

export type SheetSide = "top" | "bottom" | "left" | "right";

export type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: SheetSide;
  /** Label aksesibilitas untuk dialog. */
  label?: string;
  className?: string;
  children: React.ReactNode;
};

const SIDE_CLASSES: Record<SheetSide, string> = {
  top: "inset-x-0 top-0 border-b",
  bottom: "inset-x-0 bottom-0 border-t",
  left: "inset-y-0 left-0 w-full max-w-sm border-r",
  right: "inset-y-0 right-0 w-full max-w-sm border-l",
};

/** Drawer sederhana tanpa dependency — COMPONENTS.md §7.1. */
export function Sheet({
  open,
  onOpenChange,
  side = "top",
  label,
  className,
  children,
}: SheetProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Tutup"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 h-full w-full cursor-default bg-background/80"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          "absolute border-border bg-background-elevated shadow-elevated",
          SIDE_CLASSES[side],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
