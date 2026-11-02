import Link from "next/link";

import { cn } from "@/lib/utils/cn";

const TABS = [
  { key: "arsip", label: "Arsip Dokumentasi", href: "/dokumentasi" },
  { key: "mabar", label: "Mabar Seruu", href: "/dokumentasi/mabar-seruu" },
] as const;

/**
 * Menu tab di dalam Arsip Dokumentasi (ROUTES.md §9.3).
 * `Mabar Seruu` = kumpulan foto/video singkat hasil mabar.
 */
export function DocumentationTabs({ active }: { active: "arsip" | "mabar" }) {
  return (
    <nav aria-label="Menu dokumentasi" className="flex flex-wrap items-center gap-2">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center rounded-pill px-4 py-1.5 text-sm font-semibold transition",
              isActive
                ? "bg-primary text-on-primary"
                : "border border-border text-text-muted hover:bg-surface-hover hover:text-text",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
