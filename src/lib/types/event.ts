/**
 * Tipe domain NGABINTON — diturunkan dari schema Drizzle (single source of truth).
 * Referensi: AGENTS.md §3.2 (tipe di `lib/types/`), SCHEMA.md §3.
 */
import type {
  budgetItems,
  eventExtras,
  eventMedia,
  events,
  rundownItems,
} from "@/lib/db/schema";

export type Event = typeof events.$inferSelect;
export type RundownItem = typeof rundownItems.$inferSelect;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type EventMedia = typeof eventMedia.$inferSelect;
export type EventExtra = typeof eventExtras.$inferSelect;
