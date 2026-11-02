import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DocumentationTabs } from "@/components/gallery/documentation-tabs";
import { MabarUploadForm } from "@/components/gallery/mabar-upload-form";
import { Container } from "@/components/layout/container";
import { getRecentSessionOptions } from "@/lib/api/session-media";
import { getCurrentUser } from "@/lib/auth/guards";
import { formatDateShort } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Rekam Momen Mabar — NGABINTON",
  description: "Rekam foto atau video singkat untuk arsip Mabar Seruu NGABINTON.",
  robots: { index: false },
};

export const revalidate = 0;

export default async function UnggahMabarSeruuPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/dokumentasi/mabar-seruu/unggah");
  }

  const sessions = await getRecentSessionOptions();
  const options = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    playedAtLabel: formatDateShort(session.playedAt),
  }));

  return (
    <div className="pb-24 pt-28">
      <Container size="md">
        <Link
          href="/dokumentasi/mabar-seruu"
          className="inline-flex items-center gap-2 text-sm text-text-muted transition duration-150 ease-brand hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Kembali ke Mabar Seruu</span>
        </Link>

        <div className="mt-6">
          <DocumentationTabs active="mabar" />
        </div>

        <header className="mt-6">
          <h1 className="font-display text-[32px] leading-[1.1] tracking-[-0.02em] text-text md:text-[44px]">
            Rekam Momen Mabar
          </h1>
          <p className="mt-2 max-w-xl text-base text-text-muted">
            Pilih foto atau video (maksimal 15 detik). Setelah dikirim, momen menunggu
            persetujuan admin utama sebelum tayang di arsip.
          </p>
        </header>

        <div className="mt-8 max-w-xl rounded-xl border border-border bg-background-elevated p-6 shadow-card md:p-8">
          <MabarUploadForm sessions={options} />
        </div>
      </Container>
    </div>
  );
}
