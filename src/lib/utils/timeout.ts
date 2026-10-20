/**
 * Batas waktu operasi async di sisi aplikasi (`RULES.md` §7.4).
 *
 * Supabase Transaction Pooler mengunci `statement_timeout` di 2 menit dan
 * mengabaikan parameter startup/`SET` dari klien, jadi query yang macet tidak
 * bisa dipotong dari sisi koneksi. Helper ini memastikan halaman berhenti
 * menunggu dan menampilkan error boundary + tombol "Coba Lagi".
 */

/** Batas waktu default satu operasi baca (20 detik). */
export const DB_READ_TIMEOUT_MS = 20_000;

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operasi melebihi batas waktu ${Math.round(ms / 1000)} detik.`);
    this.name = "TimeoutError";
  }
}

/** Jalankan `operation`, tapi gagal dengan `TimeoutError` bila melewati `ms`. */
export async function withTimeout<T>(
  operation: Promise<T>,
  ms: number = DB_READ_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
