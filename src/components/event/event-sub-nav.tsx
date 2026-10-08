"use client";

import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

export type SubNavAnchor = {
  id: string;
  label: string;
};

export type EventSubNavProps = {
  anchors: SubNavAnchor[];
  variant?: "cinema" | "storytelling";
};

/** Tinggi navbar utama (fixed, `h-16`) — offset sticky & `rootMargin` observer. */
const NAVBAR_OFFSET_PX = 64;

/** Anchor yang menyembunyikan sub-nav saat aktif (ROUTES.md §2.2). */
const HIDDEN_WHEN_ACTIVE = new Set(["hero", "absen"]);

const VARIANT_CLASSES = {
  cinema: {
    bar: "border-border bg-background",
    active: "text-text",
    underline: "bg-primary",
    idle: "text-text-muted hover:text-text",
  },
  storytelling: {
    bar: "border-story-border bg-story-bg",
    active: "text-story-text",
    underline: "bg-story-teal",
    idle: "text-story-muted hover:text-story-text",
  },
} as const;

/**
 * Sub-navbar sticky dengan scroll-spy — COMPONENTS.md §3.6.
 * Muncul setelah hero lewat, aktif mengikuti section di viewport, dan hilang di
 * section presensi (`#absen`) & hero (ROUTES.md §2.2).
 */
export function EventSubNav({ anchors, variant = "cinema" }: EventSubNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const classes = VARIANT_CLASSES[variant];

  useEffect(() => {
    const sections = anchors
      .map((anchor) => document.getElementById(anchor.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting);
        if (intersecting.length === 0) {
          return;
        }
        const topmost = intersecting.reduce((closest, entry) =>
          entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest,
        );
        setActiveId(topmost.target.id);
      },
      { rootMargin: `-${NAVBAR_OFFSET_PX}px 0px -60% 0px` },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [anchors]);

  const hidden = activeId === null || HIDDEN_WHEN_ACTIVE.has(activeId);

  return (
    <nav
      aria-label="Navigasi bagian event"
      className={cn(
        "sticky top-16 z-30 border-b transition duration-200 ease-brand",
        classes.bar,
        hidden ? "pointer-events-none -translate-y-2 opacity-0" : "translate-y-0 opacity-100",
      )}
    >
      <div className="snap-x overflow-x-auto">
        <Container size="lg">
          <ul className="flex gap-6">
            {anchors.map((anchor) => {
              const isActive = anchor.id === activeId;

              return (
                <li key={anchor.id} className="shrink-0 snap-start">
                  <a
                    href={`#${anchor.id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "relative inline-flex items-center py-3 text-sm transition duration-150 ease-brand",
                      isActive ? classes.active : classes.idle,
                    )}
                  >
                    {anchor.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-pill transition-transform duration-200 ease-brand",
                        classes.underline,
                        isActive ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </Container>
      </div>
    </nav>
  );
}
