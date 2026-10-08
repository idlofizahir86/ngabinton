import { cn } from "@/lib/utils/cn";

export type EventMetaBarProps = {
  items: string[];
  separator?: string;
  variant?: "cinema" | "storytelling";
};

/**
 * Baris metadata event (tanggal · waktu · lokasi · biaya) — COMPONENTS.md §3.9.
 * Server Component. Item kosong/`null` dibuang; baris disembunyikan bila semua kosong.
 */
export function EventMetaBar({
  items,
  separator = "·",
  variant = "cinema",
}: EventMetaBarProps) {
  const visible = items.filter((item) => item.trim().length > 0);
  if (visible.length === 0) {
    return null;
  }

  return (
    <p
      className={cn(
        "text-xs uppercase tracking-[0.04em]",
        variant === "storytelling" ? "text-story-muted" : "text-text-muted",
      )}
    >
      {visible.join(` ${separator} `)}
    </p>
  );
}
