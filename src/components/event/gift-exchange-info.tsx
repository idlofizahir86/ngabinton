import { Check, Gift } from "lucide-react";

import { formatRupiah } from "@/lib/utils/format";

export type GiftExchangeInfoProps = {
  budgetMin: number;
  budgetMax: number;
  rules: string[];
};

/**
 * Card info tukar kado — COMPONENTS.md §4.6 / DESIGN.md §7.12.
 * Server Component. Judul dari CONTENT.md §4.10.
 */
export function GiftExchangeInfo({ budgetMin, budgetMax, rules }: GiftExchangeInfoProps) {
  return (
    <div className="rounded-md border-l-4 border-l-story-orange bg-story-orange/15 p-6">
      <Gift aria-hidden strokeWidth={1.5} className="h-8 w-8 text-story-orange" />

      <h3 className="mt-3 text-xl font-semibold text-story-text">Tukar Kado</h3>

      <p className="mt-1 text-lg font-semibold text-story-text">
        {formatRupiah(budgetMin)} – {formatRupiah(budgetMax)}
      </p>

      {rules.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {rules.map((rule) => (
            <li key={rule} className="flex items-start gap-3 text-base text-story-text-secondary">
              <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-story-orange" />
              {rule}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
