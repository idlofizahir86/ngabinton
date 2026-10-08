/**
 * Seed database NGABINTON — **idempoten** (aman dijalankan berulang).
 * Jalankan: `pnpm tsx scripts/seed.ts`
 * Referensi: CONTENT.md §4 & §6, SETUP.md §7.
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const SLUG = "lanjalan-vol-1";

async function main() {
  process.loadEnvFile(".env.local");

  // Dynamic import: `client.ts` membaca DATABASE_URL saat di-import,
  // jadi env harus dimuat lebih dulu.
  const { db } = await import("../src/lib/db/client");
  const { users, events, rundownItems, budgetItems, eventExtras, eventMedia } = await import(
    "../src/lib/db/schema"
  );

  // ------------------------------------------------------------
  // 1) Admin user
  // ------------------------------------------------------------
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("SEED_ADMIN_PASSWORD belum diset di .env.local");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const createdUsers = await db
    .insert(users)
    .values({
      username,
      passwordHash,
      displayName: "Admin NGABINTON",
      role: "admin",
    })
    .onConflictDoNothing({ target: users.username })
    .returning({ id: users.id });
  console.log(createdUsers.length ? `✅ Admin dibuat: ${username}` : `↷ Admin sudah ada: ${username}`);

  // ------------------------------------------------------------
  // 2) Event
  // ------------------------------------------------------------
  const createdEvents = await db
    .insert(events)
    .values({
      slug: SLUG,
      title: "Lan Jalan Vol. 1",
      subtitle: "Yuk Traveling — Walini Hot Spring, Ciwidey",
      eventType: "travel",
      theme: "storytelling",
      heroImageUrl: "/events/lanjalan-vol-1/hero-walini.jpg",
      coverImageUrl: "/events/lanjalan-vol-1/cover-travel.jpg",
      startsAt: new Date("2026-10-10T06:00:00+07:00"),
      endsAt: new Date("2026-10-10T18:00:00+07:00"),
      meetingPoint: "Vasati Rabbani",
      meetingTime: "06.00 WIB",
      returnTime: "18.00 WIB",
      location: "Walini Hot Spring, Ciwidey",
      locationUrl: "https://share.google/7MTyzAyowSQePVniK",
      transportMode: "Angkot (sewa)",
      price: 175000,
      quota: 20,
      isPublished: true,
      isFeatured: true,
    })
    .onConflictDoNothing({ target: events.slug })
    .returning({ id: events.id });

  let eventId = createdEvents[0]?.id;
  if (eventId) {
    console.log(`✅ Event dibuat: ${SLUG}`);
  } else {
    const found = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, SLUG))
      .limit(1);
    eventId = found[0]?.id;
    console.log(`↷ Event sudah ada: ${SLUG}`);
  }
  if (!eventId) {
    throw new Error("Gagal mendapatkan id event");
  }

  // ------------------------------------------------------------
  // 3) Rundown (6 item) — CONTENT.md §4.7
  // ------------------------------------------------------------
  await db
    .insert(rundownItems)
    .values([
      { eventId, order: 0, time: "06.00", title: "Kumpul di Vasati Rabbani", note: "Titik kumpul utama" },
      { eventId, order: 1, time: "06.00 – 08.30", title: "Perjalanan menuju Walini Hot Spring", note: "Plus penjemputan di beberapa titik" },
      { eventId, order: 2, time: "08.30 – 12.15", title: "Eksplore Walini Hot Spring", note: "Berendam dll" },
      { eventId, order: 3, time: "12.15 – 14.30", title: "Makan siang di Pawon Kang Bima", note: "Sekalian tukar kado (10K–15K)" },
      { eventId, order: 4, time: "14.30 – 15.30", title: "Petik Stroberi", note: "Optional", isOptional: true },
      { eventId, order: 5, time: "15.30 – 18.00", title: "Perjalanan pulang", note: "Ke rumah masing-masing yaa" },
    ])
    .onConflictDoNothing({ target: [rundownItems.eventId, rundownItems.order] });
  console.log("✅ Rundown: 6 item");

  // ------------------------------------------------------------
  // 4) Budget (6 item + TOTAL) — CONTENT.md §4.9
  // ------------------------------------------------------------
  await db
    .insert(budgetItems)
    .values([
      { eventId, order: 0, label: "Angkot", amount: 50000 },
      { eventId, order: 1, label: "Tiket Walini Hot Spring", amount: 40000 },
      { eventId, order: 2, label: "Sewa Gazebo", amount: 10000 },
      { eventId, order: 3, label: "Makan Siang", amount: 50000 },
      { eventId, order: 4, label: "Tiket Petik Stroberi", amount: 10000 },
      { eventId, order: 5, label: "Lain-lain", amount: 15000 },
      { eventId, order: 6, label: "TOTAL", amount: 175000, isTotal: true },
    ])
    .onConflictDoNothing({ target: [budgetItems.eventId, budgetItems.order] });
  console.log("✅ Budget: 6 item + TOTAL");

  // ------------------------------------------------------------
  // 5) Extras (5 key) — CONTENT.md §4.3, §4.4, §4.6, §4.9, §4.10
  // ------------------------------------------------------------
  await db
    .insert(eventExtras)
    .values([
      {
        eventId,
        key: "quran_verse",
        value: {
          arabic:
            "هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِنْ رِزْقِهِ ۖ وَإِلَيْهِ النُّشُورُ",
          translation:
            "Dialah yang menjadikan bumi untuk kamu yang mudah dijelajahi, maka jelajahilah di segala penjurunya dan makanlah sebagian dari rezeki-Nya. Dan hanya kepada-Nyalah kamu (kembali setelah) dibangkitkan.",
          source: "Q.S Al Mulk : 15",
        },
      },
      {
        eventId,
        key: "narrative",
        value: {
          title: "Rencana yang Telah Direncanakan",
          body: "Begitu banyak rencana yang telah kita rencanakan, ingatkan kamu… lalu ini arahnya kemana???",
        },
      },
      {
        eventId,
        key: "gift_exchange",
        value: {
          budget_min: 10000,
          budget_max: 15000,
          rules: [
            "Budget Rp 10.000 – Rp 15.000",
            "Unisex (bebas gender)",
            "Wajib bawa 1 kado per orang",
            "Ditukar saat makan siang",
          ],
        },
      },
      {
        eventId,
        key: "pickup_points",
        value: ["Vasati Rabbani (titik utama)", "Samsat Seokarno Hatta", "Banjaran", "Soreang"],
      },
      {
        eventId,
        key: "payment_info",
        value: {
          bank: "[PLACEHOLDER: BCA / BRI / Mandiri / dst]",
          account_number: "[PLACEHOLDER: 0000000000]",
          account_name: "Bu Triii",
          deadline: "2026-10-10",
        },
      },
    ])
    .onConflictDoNothing({ target: [eventExtras.eventId, eventExtras.key] });
  console.log("✅ Extras: 5 key");

  // ------------------------------------------------------------
  // 6) Media (5 item) — SCHEMA.md §3.5 & ASSETS.md §2
  // ------------------------------------------------------------
  // Hero & cover tetap di `events.hero_image_url` / `cover_image_url` (SCHEMA.md §3.5),
  // jadi tidak diduplikasi di sini.
  const mediaBaseUrl = `/events/${SLUG}`;
  const existingMedia = await db
    .select({ id: eventMedia.id })
    .from(eventMedia)
    .where(eq(eventMedia.eventId, eventId))
    .limit(1);

  if (existingMedia.length === 0) {
    await db.insert(eventMedia).values([
      {
        eventId,
        type: "destination",
        url: `${mediaBaseUrl}/dest-walini.jpg`,
        alt: "Kolam air panas Walini di Ciwidey",
        order: 0,
      },
      {
        eventId,
        type: "transport",
        url: `${mediaBaseUrl}/transport-angkot.jpg`,
        alt: "Angkot sewaan di jalan menuju Ciwidey",
        order: 0,
      },
      {
        eventId,
        type: "food",
        url: `${mediaBaseUrl}/food-pawon.jpg`,
        alt: "Teras resto Sunda Pawon Kang Bima",
        order: 0,
      },
      {
        eventId,
        type: "food",
        url: `${mediaBaseUrl}/menu-pawon.jpg`,
        alt: "Nasi liwet dan telor di Pawon Kang Bima",
        order: 1,
      },
      {
        eventId,
        type: "participant",
        url: `${mediaBaseUrl}/participants-collage.jpg`,
        alt: "Kolase peserta Lan Jalan Vol. 1",
        order: 0,
      },
    ]);
    console.log("✅ Media: 5 item");
  } else {
    console.log("↷ Media sudah ada");
  }

  console.log("✅ Seed selesai");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Seed gagal:", error);
  process.exit(1);
});
