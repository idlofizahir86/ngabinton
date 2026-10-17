/** Validasi badge kustom (RULES.md §13.7). */
import { z } from "zod";

import { ACHIEVEMENT_ICONS, ACHIEVEMENT_TONES } from "@/lib/constants";
import { optionalText } from "@/lib/validators/common";

export const achievementDefinitionSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Kode minimal 3 karakter.")
    .max(40, "Kode maksimal 40 karakter.")
    .regex(/^[a-z0-9_]+$/, "Kode hanya boleh huruf kecil, angka, dan underscore."),
  name: z.string().trim().min(3, "Nama badge minimal 3 karakter.").max(60),
  description: optionalText(200),
  icon: z.enum(ACHIEVEMENT_ICONS, { message: "Ikon tidak valid." }),
  tone: z.enum(ACHIEVEMENT_TONES, { message: "Warna badge tidak valid." }),
});

/** Edit badge — kode tidak diubah agar riwayat tetap konsisten. */
export const achievementDefinitionUpdateSchema = achievementDefinitionSchema.omit({ code: true });

export const awardCustomAchievementSchema = z.object({
  memberId: z.coerce.number().int().positive("Pilih anggota."),
  definitionId: z.string().uuid("Pilih badge."),
  note: optionalText(200),
});
