import { BudgetTable } from "@/components/event/budget-table";
import { ClosingMessage } from "@/components/event/closing-message";
import { DestinationCard } from "@/components/event/destination-card";
import { EventSection } from "@/components/event/event-section";
import { GiftExchangeInfo } from "@/components/event/gift-exchange-info";
import { ParticipantGrid } from "@/components/event/participant-grid";
import { QuranQuote } from "@/components/event/quran-quote";
import { RundownTimeline } from "@/components/event/rundown-timeline";
import { StoryNarrative } from "@/components/event/story-narrative";
import { TransportCard } from "@/components/event/transport-card";
import type { EventDetail } from "@/lib/api/events";
import { STORY_COPY, narrativeImagePath } from "@/lib/event-content";
import type { EventMedia, EventStatus } from "@/lib/types/event";
import type { ParsedEventExtras } from "@/lib/validators/event-extras";

export type EventSectionsProps = {
  event: EventDetail;
  extras: ParsedEventExtras;
  status: EventStatus;
  variant: "cinema" | "storytelling";
};

/**
 * Susunan section halaman event (`DESIGN.md` §2 ritme, `ROUTES.md` §2.1 anchor).
 * Dipisah dari `page.tsx` agar file halaman tetap ringkas (`AGENTS.md` §3.2 no. 12).
 */
export function EventSections({ event, extras, status, variant }: EventSectionsProps) {
  const isCinema = variant === "cinema";
  const isStory = !isCinema;

  const mediaOf = (type: EventMedia["type"]) => event.media.filter((item) => item.type === type);
  const destinationMedia = mediaOf("destination")[0] ?? null;
  const transportMedia = mediaOf("transport")[0] ?? null;
  const foodMedia = mediaOf("food")[0] ?? null;
  const [teamMedia, ...otherParticipantMedia] = mediaOf("participant");

  const paymentExtra = extras.paymentInfo;
  const paymentInfo = paymentExtra
    ? {
        bank: paymentExtra.bank,
        accountNumber: paymentExtra.account_number,
        accountName: paymentExtra.account_name,
        deadline: paymentExtra.deadline,
      }
    : undefined;

  return (
    <>
      {/* #pembuka — ayat (storytelling) */}
      {isStory && extras.quranVerse ? (
        <QuranQuote
          arabic={extras.quranVerse.arabic}
          translation={extras.quranVerse.translation}
          source={extras.quranVerse.source}
        />
      ) : null}
      {/* #narasi */}
      {isStory && extras.narrative ? (
        <EventSection id="narasi" variant="storytelling" tone="alt">
          <StoryNarrative
            title={extras.narrative.title}
            body={extras.narrative.body}
            image={narrativeImagePath(event.slug)}
            imageAlt="Ilustrasi tiga teman bingung memilih arah di persimpangan jalan"
          />
        </EventSection>
      ) : null}
      {/* #destinasi */}
      {isStory && destinationMedia ? (
        <EventSection
          id="destinasi"
          title={STORY_COPY.destinasi.title}
          variant="storytelling"
          tone="base"
        >
          <DestinationCard
            name={STORY_COPY.destinasi.name}
            region={STORY_COPY.destinasi.region}
            description={STORY_COPY.destinasi.description}
            image={destinationMedia.url}
            imageAlt={destinationMedia.alt ?? undefined}
            duration={STORY_COPY.destinasi.duration}
            mapsUrl={STORY_COPY.destinasi.mapsUrl}
          />
        </EventSection>
      ) : null}
      {/* #transportasi */}
      {isStory && extras.pickupPoints ? (
        <EventSection
          id="transportasi"
          title={STORY_COPY.transportasi.title}
          variant="storytelling"
          tone="alt"
        >
          <TransportCard
            mode={event.transportMode ?? STORY_COPY.transportasi.title}
            description={STORY_COPY.transportasi.description}
            pickupPoints={extras.pickupPoints}
            image={transportMedia?.url}
            imageAlt={transportMedia?.alt ?? undefined}
          />
        </EventSection>
      ) : null}

      {/* #rundown — selalu gelap/cinema (DESIGN.md §2: "Rundown (gelap, kontras)") */}
      {event.rundownItems.length > 0 ? (
        <EventSection id="rundown" title="Rundown" variant={variant} tone="dark">
          <RundownTimeline
            items={event.rundownItems}
            variant="cinema"
            highlightNow={status === "live"}
          />
        </EventSection>
      ) : null}
      {/* #makan */}
      {isStory && foodMedia ? (
        <EventSection id="makan" title={STORY_COPY.makan.title} variant="storytelling" tone="base">
          <StoryNarrative
            body={STORY_COPY.makan.description}
            image={foodMedia.url}
            imageAlt={foodMedia.alt ?? undefined}
          />
        </EventSection>
      ) : null}

      {/* #biaya — tabel rinci + baris TOTAL (COMPONENTS.md §4.5) */}
      {event.budgetItems.length > 0 ? (
        <EventSection
          id="biaya"
          title="Biaya"
          description="Sudah termasuk semua. Tinggal bawa uang jajan tambahan buat oleh-oleh."
          variant={variant}
          tone={isCinema ? "base" : "alt"}
        >
          <BudgetTable items={event.budgetItems} variant={variant} paymentInfo={paymentInfo} />
        </EventSection>
      ) : null}
      {/* #kado */}
      {isStory && extras.giftExchange ? (
        <EventSection id="kado" variant="storytelling" tone="base">
          <GiftExchangeInfo
            budgetMin={extras.giftExchange.budget_min}
            budgetMax={extras.giftExchange.budget_max}
            rules={extras.giftExchange.rules}
          />
        </EventSection>
      ) : null}

      {/* #peserta — kolase tim 16:9 (media `participant` pertama) + kolase foto 1:1 */}
      {isStory && teamMedia ? (
        <EventSection
          id="peserta"
          title={STORY_COPY.peserta.title}
          description={STORY_COPY.peserta.description}
          variant="storytelling"
          tone="alt"
        >
          <ParticipantGrid
            images={[{ url: teamMedia.url, alt: teamMedia.alt ?? event.title }]}
            columns={1}
            aspect="video"
          />

          {otherParticipantMedia.length > 0 ? (
            <div className="mt-4 max-w-md">
              <ParticipantGrid
                images={otherParticipantMedia.map((item) => ({
                  url: item.url,
                  alt: item.alt ?? event.title,
                }))}
                columns={1}
              />
            </div>
          ) : null}
        </EventSection>
      ) : null}
      {/* #absen — presensi dibuka di M6; sekarang hanya keterangan (bukan tombol mati) */}
      {isStory ? (
        <EventSection id="absen" title={STORY_COPY.absen.title} variant="storytelling" tone="dark">
          <p className="max-w-2xl text-base text-text-muted">{STORY_COPY.absen.description}</p>
        </EventSection>
      ) : null}
      {/* #penutup */}
      {isStory ? (
        <ClosingMessage
          text="See you in the ANGKOT!"
          ctaText="Lihat Event Lain"
          ctaHref="/arsip"
          image={teamMedia?.url}
          imageAlt={teamMedia?.alt ?? undefined}
        />
      ) : null}
    </>
  );
}
