import { Container } from "@/components/layout/container";

export type QuranQuoteProps = {
  arabic: string;
  translation: string;
  source: string;
};

/**
 * Section pembuka: ayat Al-Quran + terjemahan — COMPONENTS.md §4.1.
 * Server Component. Section ini memiliki `id="pembuka"` (ROUTES.md §2.1).
 */
export function QuranQuote({ arabic, translation, source }: QuranQuoteProps) {
  return (
    <section id="pembuka" className="scroll-mt-32 bg-story-bg">
      <Container size="md" className="py-16 md:py-24">
        <figure>
          <p
            lang="ar"
            dir="rtl"
            className="text-center font-arabic text-2xl leading-[2] text-story-text md:text-3xl"
          >
            {arabic}
          </p>

          <figcaption className="mt-8">
            <p className="mx-auto max-w-[65ch] text-center text-lg leading-[1.7] text-story-text-secondary">
              {translation}
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <span aria-hidden className="h-px w-8 bg-story-border" />
              <p className="text-xs uppercase tracking-[0.04em] text-story-muted">{source}</p>
              <span aria-hidden className="h-px w-8 bg-story-border" />
            </div>
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
