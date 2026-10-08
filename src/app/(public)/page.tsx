import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";

/**
 * Latar hero landing (foto komunitas) — CONTENT.md §3.1.
 * Aset belum tersedia → biarkan `null` (latar gelap + overlay saja).
 * Saat foto siap, taruh di `public/` lalu isi path-nya, mis. "/brand/hero-community.jpg".
 */
const HERO_IMAGE_URL: string | null = null;

/** Metadata hero: jumlah member · tahun berdiri · kota (CONTENT.md §1.1). */
const HERO_META = ["~20 member", "Sejak 2025", "Bandung"];

/** Hero landing — DESIGN.md §7.2, konten CONTENT.md §3.1. */
export default function Home() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden md:min-h-[80vh]">
      {HERO_IMAGE_URL ? (
        <Image src={HERO_IMAGE_URL} alt="" fill priority className="object-cover" />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-surface" />
      )}

      {/* Overlay gradient (DESIGN.md §7.2) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,20,0.2)_0%,rgba(20,20,20,0.6)_60%,#141414_100%)]"
      />

      <Container size="full" className="relative py-24">
        <h1 className="font-display text-[48px] leading-[1.05] tracking-[-0.02em] text-text md:text-[88px]">
          NGABINTON
        </h1>

        <p className="mt-4 max-w-2xl text-xl font-semibold text-text md:text-2xl">
          Ngaji, ngobrol, badminton — dan sesekali jalan-jalan.
        </p>
        <p className="mt-3 max-w-2xl text-base text-text-secondary md:text-lg">
          Komunitas badminton mingguan yang suka kumpul, main bareng, dan kadang jalan-jalan. Yuk
          ikutan!
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/#events" className={buttonClass("primary", "lg")}>
            Lihat Event Terbaru
          </Link>
          <Link href="/tentang" className={buttonClass("ghost", "lg")}>
            Tentang Klub
          </Link>
        </div>

        <p className="mt-12 text-xs uppercase tracking-[0.04em] text-text-muted">
          {HERO_META.join(" · ")}
        </p>
      </Container>
    </section>
  );
}
