import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonClass } from "@/components/ui/button";

export type ClosingMessageProps = {
  /** Kalimat penutup dengan font script, mis. "See you in the ANGKOT!". */
  text: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  /** Gambar penutup opsional (mis. kolase tim). */
  image?: string;
  imageAlt?: string;
};

/**
 * Section penutup — COMPONENTS.md §4.8 / DESIGN.md §7.14.
 * Server Component. Section ini memiliki `id="penutup"` (ROUTES.md §2.1).
 * Font script hanya dipakai di sini (DESIGN.md §4 aturan).
 */
export function ClosingMessage({
  text,
  subtitle,
  ctaText,
  ctaHref,
  image,
  imageAlt,
}: ClosingMessageProps) {
  return (
    <section id="penutup" className="scroll-mt-32 bg-story-bg">
      <Container size="md" className="py-16 text-center md:py-24">
        <p className="font-script text-4xl leading-tight text-story-script md:text-6xl">{text}</p>

        {subtitle ? (
          <p className="mx-auto mt-4 max-w-[65ch] text-base text-story-muted">{subtitle}</p>
        ) : null}

        {ctaText && ctaHref ? (
          <div className="mt-8">
            <Link href={ctaHref} className={buttonClass("story-ghost", "md")}>
              {ctaText}
            </Link>
          </div>
        ) : null}

        {image ? (
          <div className="relative mt-12 aspect-video overflow-hidden rounded-lg shadow-story">
            <Image
              src={image}
              alt={imageAlt ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>
        ) : null}
      </Container>
    </section>
  );
}
