import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Masuk — NGABINTON",
  robots: { index: false },
};

/** Foto latar halaman login — OG default (ASSETS.md §1). */
const BACKGROUND_IMAGE_URL = "/og/default.jpg";

/** Foto latar diredupkan supaya form tetap jadi fokus (bukan full-opacity). */
const BACKGROUND_IMAGE_CLASS = "object-cover opacity-25";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

/** Halaman login admin — ROUTES.md §1.1 & CONTENT.md §5.1. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectTo } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden py-16">
      <Image
        src={BACKGROUND_IMAGE_URL}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className={BACKGROUND_IMAGE_CLASS}
      />

      {/* Overlay gradient (DESIGN.md §7.2) supaya kontras teks tetap aman. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,20,0.5)_0%,rgba(20,20,20,0.75)_60%,#141414_100%)]"
      />

      <Container size="md" className="relative">
        <Link href="/" className={buttonClass("ghost", "sm", "mb-6")}>
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <div className="rounded-lg border border-border bg-surface p-8 shadow-elevated">
          <BrandLogo priority className="h-7 w-auto" />

          <h1 className="mt-6 text-3xl font-bold text-text">Masuk</h1>
          <p className="mt-2 text-sm text-text-muted">
            Untuk pengurus dan anggota club NGABINTON.
          </p>

          <div className="mt-8">
            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </Container>
    </main>
  );
}
