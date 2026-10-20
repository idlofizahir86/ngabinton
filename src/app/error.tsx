"use client";

import Link from "next/link";
import { useEffect } from "react";

import { buttonClass } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Error boundary global untuk semua route (RULES.md §7.4).
 * Menangkap kegagalan render/DB agar tidak muncul layar putih, lalu
 * menawarkan tombol "Coba Lagi" tanpa reload penuh.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-8 text-center shadow-card">
        <p className="text-xs uppercase tracking-[0.04em] text-danger">Gangguan</p>
        <h1 className="mt-2 font-display text-3xl text-text">Halaman gagal dimuat</h1>
        <p className="mt-3 text-sm text-text-muted">
          Koneksi ke server sedang lambat atau terputus. Coba lagi sebentar lagi — data kamu tidak
          hilang.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-text-subtle">Kode kesalahan: {error.digest}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className={buttonClass("primary", "sm")}>
            Coba Lagi
          </button>
          <Link href="/" className={buttonClass("ghost", "sm")}>
            Ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
