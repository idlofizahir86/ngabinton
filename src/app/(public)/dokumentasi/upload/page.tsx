import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DocumentationUploadForm } from "@/components/gallery/documentation-upload-form";
import { Container } from "@/components/layout/container";
import { getCurrentUser } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Upload Dokumentasi — NGABINTON",
  description:
    "Unggah foto keseruan event atau mabar badminton komunitas NGABINTON.",
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  state_mismatch: "Sesi koneksi tidak cocok. Coba hubungkan ulang.",
  no_refresh_token: "Google tidak memberi refresh token. Coba lagi.",
  token_not_saved:
    "Token tidak bisa disimpan di server. Simpan token ke env GOOGLE_REFRESH_TOKEN.",
  exchange_failed: "Gagal menukar kode OAuth dengan token.",
};

type UploadPageProps = {
  searchParams: Promise<{ connected?: string; auth_error?: string }>;
};

export default async function UploadDokumentasiPage({
  searchParams,
}: UploadPageProps) {
  // Hanya anggota yang login boleh mengunggah ke Drive komunitas.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dokumentasi/upload");
  }

  const { connected, auth_error } = await searchParams;
  const notice = connected
    ? { tone: "ok" as const, text: "Google Drive berhasil terhubung." }
    : auth_error
      ? {
          tone: "error" as const,
          text:
            AUTH_ERROR_MESSAGES[auth_error] ??
            `Gagal menghubungkan Google Drive (${auth_error}).`,
        }
      : null;

  return (
    <div className="pb-24 pt-28">
      <Container size="full">
        {/* Tombol Kembali */}
        <Link
          href="/dokumentasi"
          className="inline-flex items-center gap-2 text-sm text-text-muted transition duration-150 ease-brand hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Arsip Dokumentasi</span>
        </Link>

        <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,42rem)_minmax(0,1fr)] xl:gap-16">
          {/* === Kolom kiri: header + notice + form === */}
          <div className="flex flex-col gap-8">
            <div className="max-w-2xl">
              <h1 className="font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-text md:text-[44px]">
                Upload Dokumentasi Baru
              </h1>
              <p className="mt-2 text-base text-text-muted">
                Bagikan momen terbaik saat mabar atau event. Pastikan foto lucu!
              </p>
            </div>

            {notice ? (
              <p
                role={notice.tone === "error" ? "alert" : "status"}
                className={`max-w-2xl rounded-md border px-4 py-3 text-sm ${
                  notice.tone === "error"
                    ? "border-danger/40 bg-danger/10 text-danger"
                    : "border-live/40 bg-live/10 text-live"
                }`}
              >
                {notice.text}
              </p>
            ) : null}

            <div className="max-w-2xl rounded-xl border border-border bg-background-elevated p-6 shadow-card md:p-8">
              <DocumentationUploadForm />
            </div>
          </div>

          {/* === Kolom kanan: branding, hanya xl+ === */}
          <aside className="hidden xl:block" aria-hidden="true">
            <div className="sticky top-28">
              <p className="font-display text-[72px] font-bold leading-[0.95] tracking-[-0.04em] text-danger 2xl:text-[96px]">
                Ngabinton
              </p>
              <p className="font-display text-[72px] font-bold leading-[0.95] tracking-[-0.04em] text-text 2xl:text-[96px]">
                Dokumentasi
              </p>

              {/* Aksen garis */}
              <div className="mt-8 h-1 w-24 rounded-pill bg-primary" />

              <p className="mt-6 max-w-sm text-sm leading-relaxed text-text-muted">
                Satu judul untuk satu batch. Pilih sampai 50 foto sekaligus,
                tanggal diambil otomatis dari metadata file.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
