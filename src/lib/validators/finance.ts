/** Validasi input keuangan (RULES.md §16). */
import { z } from "zod";

import { optionalText } from "@/lib/validators/common";

const MAX_AMOUNT = 1_000_000_000;

export const financeEntrySchema = z.object({
  type: z.enum(["income", "expense"], { message: "Jenis transaksi tidak valid." }),
  amount: z.coerce
    .number()
    .int("Nominal harus bilangan bulat.")
    .positive("Nominal harus lebih dari 0.")
    .max(MAX_AMOUNT, "Nominal terlalu besar."),
  description: z.string().trim().min(3, "Keterangan minimal 3 karakter.").max(200),
  category: z.string().trim().min(2, "Kategori minimal 2 karakter.").max(40),
  occurredAt: z.string().trim().min(1, "Tanggal transaksi wajib diisi."),
  playSessionId: optionalText(40).refine(
    (value) => value === null || /^[0-9a-f-]{36}$/i.test(value),
    { message: "Sesi tidak valid." },
  ),
  paymentMethod: z.enum(["cash", "transfer"], { message: "Metode pembayaran tidak valid." }),
  payerUserId: optionalText(20).refine(
    (value) => value === null || /^\d+$/.test(value),
    { message: "Anggota pembayar tidak valid." },
  ),
});

export type FinanceEntryInput = z.infer<typeof financeEntrySchema>;

/** Input massal iuran sesi: satu transaksi per anggota terpilih. */
export const bulkSessionDuesSchema = z.object({
  sessionId: z.string().uuid("Sesi tidak valid."),
  amount: z.coerce
    .number()
    .int("Nominal harus bilangan bulat.")
    .positive("Nominal harus lebih dari 0.")
    .max(MAX_AMOUNT, "Nominal terlalu besar."),
  paymentMethod: z.enum(["cash", "transfer"], { message: "Metode pembayaran tidak valid." }),
  occurredAt: z.string().trim().min(1, "Tanggal transaksi wajib diisi."),
  memberIds: z
    .array(z.coerce.number().int().positive())
    .min(1, "Pilih minimal satu anggota yang membayar."),
  description: optionalText(120),
});

export type BulkSessionDuesInput = z.infer<typeof bulkSessionDuesSchema>;

/** Perpindahan dana antar dompet (Cash ↔ Rekening Bank). */
export const financeTransferSchema = z
  .object({
    fromMethod: z.enum(["cash", "transfer"], { message: "Dompet asal tidak valid." }),
    toMethod: z.enum(["cash", "transfer"], { message: "Dompet tujuan tidak valid." }),
    amount: z.coerce
      .number()
      .int("Nominal harus bilangan bulat.")
      .positive("Nominal harus lebih dari 0.")
      .max(MAX_AMOUNT, "Nominal terlalu besar."),
    description: z.string().trim().min(3, "Keterangan minimal 3 karakter.").max(200),
    occurredAt: z.string().trim().min(1, "Tanggal transaksi wajib diisi."),
  })
  .refine((value) => value.fromMethod !== value.toMethod, {
    message: "Dompet asal dan tujuan harus berbeda.",
    path: ["toMethod"],
  });

export type FinanceTransferInput = z.infer<typeof financeTransferSchema>;
