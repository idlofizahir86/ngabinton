import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

/** Nada latar section mengikuti ritme gelap-terang (`DESIGN.md` §2). */
export type EventSectionTone = "base" | "alt" | "dark";

export type EventSectionProps = {
  id: string;
  /** Judul section; kosongkan kalau konten sudah punya heading sendiri. */
  title?: string;
  /** Paragraf pembuka opsional di bawah judul. */
  description?: string;
  variant?: "cinema" | "storytelling";
  tone?: EventSectionTone;
  children: React.ReactNode;
};

/**
 * Wrapper section halaman event — latar + border + judul + container,
 * mengikuti `DESIGN.md` §2 (ritme gelap-terang).
 * Varian storytelling memakai token `story-*` dan container lebih sempit (majalah).
 */
const TONE_CLASSES: Record<EventSectionTone, Record<"cinema" | "storytelling", string>> = {
  base: {
    cinema: "border-border/60 bg-background",
    storytelling: "border-story-border bg-story-bg",
  },
  alt: {
    cinema: "border-border/60 bg-background-elevated",
    storytelling: "border-story-border bg-story-bg-alt",
  },
  dark: {
    cinema: "border-border/60 bg-background",
    storytelling: "border-border/60 bg-background",
  },
};

export function EventSection({
  id,
  title,
  description,
  variant = "cinema",
  tone = "base",
  children,
}: EventSectionProps) {
  const isStory = variant === "storytelling";

  return (
    <section
      id={id}
      className={cn("scroll-mt-32 border-b py-20 md:py-24", TONE_CLASSES[tone][variant])}
    >
      <Container size={isStory ? "md" : "lg"}>
        {title ? (
          <h2
            className={cn(
              "font-display text-3xl md:text-4xl",
              isStory ? "text-story-text" : "text-text",
            )}
          >
            {title}
          </h2>
        ) : null}

        {description ? (
          <p className={cn("mt-4 max-w-2xl text-base", isStory ? "text-story-muted" : "text-text-muted")}>
            {description}
          </p>
        ) : null}

        <div className={title || description ? "mt-8" : undefined}>{children}</div>
      </Container>
    </section>
  );
}
