/** Validasi assign EO event (RULES.md §13.8). */
import { z } from "zod";

export const eventOrganizerSchema = z.object({
  eventId: z.string().uuid("Pilih event."),
  memberId: z.coerce.number().int().positive("Pilih anggota."),
});
