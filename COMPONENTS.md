# `COMPONENTS.md`

# COMPONENTS — NGABINTON

> **Sumber kebenaran untuk inventaris komponen.**
> Setiap komponen baru wajib didaftarkan di sini SEBELUM diimplementasi.
> Agent DILARANG membuat komponen yang sudah ada di daftar ini.
> Cek dulu, baru bikin.

---

## 0. Ringkasan Cepat (TL;DR)

```yaml
Kategori:
  layout:       5 komponen
  event:        9 komponen
  storytelling: 8 komponen
  presensi:     7 komponen
  admin:        6 komponen
  ui:           12 primitives (shadcn)

Aturan:
  - Cek daftar ini dulu sebelum bikin komponen baru
  - Update file ini SEBELUM implementasi
  - Komponen di components/ui/ = dumb, no data fetching
  - Komponen di components/<fitur>/ = boleh terima data via props
  - Semua props pakai type dari lib/types/, bukan inline
```

---

## 1. Aturan Umum Komponen

### 1.1 Prinsip
1. **Satu komponen, satu tanggung jawab.** Kalau komponen > 200 baris, pecah.
2. **Props bertipe dari `lib/types/`**, bukan inline object.
3. **Default ke Server Component.** Tambah `"use client"` hanya kalau butuh state, event handler, atau browser API.
4. **Komponen UI (`ui/`) tidak fetch data.** Dumb murni.
5. **Komponen fitur boleh terima data via props**, tapi tidak fetch langsung. Fetch di page.
6. **Tidak ada inline style.** Semua via Tailwind class dari token di `DESIGN.md`.

### 1.2 Konvensi Props
```ts
// Nama komponen: PascalCase
// Nama file: kebab-case
// Props: camelCase

type EventCardProps = {
  event: Event;
  variant?: 'default' | 'compact';
  onHover?: () => void;
};

export function EventCard({ event, variant = 'default', onHover }: EventCardProps) {
  // ...
}
```

### 1.3 Konvensi Export
- **Default export** untuk page & layout (wajib Next.js).
- **Named export** untuk semua komponen lain.

### 1.4 Struktur File Komponen
```
components/event/event-card.tsx
  ├── imports
  ├── types (kalau ada props spesifik)
  ├── component (named export)
  ├── sub-components (kalau perlu, tetap dalam file yang sama)
  └── export default? tidak, pakai named
```

---

## 2. Layout Components

Lokasi: `src/components/layout/`

### 2.1 `<Container />`

Wrapper untuk max-width + padding horizontal responsif.

**Props:**
```ts
type ContainerProps = {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  as?: 'div' | 'section' | 'article';
  className?: string;
};
```

**Size mapping:**
| Size | Max-width | Dipakai di |
|---|---|---|
| `sm` | 480px | Form presensi, login |
| `md` | 720px | Section cerita (storytelling), halaman tentang |
| `lg` | 1024px | Halaman event utama |
| `xl` | 1280px | Admin dashboard |
| `full` | 1600px | Landing, carousel |

**Aturan:**
- Semua halaman wajib pakai `<Container />`, jangan langsung set `max-w-*`.
- Padding horizontal otomatis: 16px mobile, 24px tablet, 64px desktop.

---

### 2.2 `<Navbar />`

Navbar publik dengan behavior transparan → solid saat scroll.

**Props:**
```ts
type NavbarProps = {
  variant?: 'public' | 'minimal';
  transparentOnTop?: boolean;   // default true
};
```

**Variant:**
- `public` — logo + menu (Event, Arsip, Tentang, Kontak) + tombol "Masuk"
- `minimal` — logo + tombol "Masuk" saja (dipakai di halaman error, halaman sederhana)

**Behavior:**
- Saat `scrollY < 40px`: background transparan
- Saat `scrollY >= 40px`: background `background-elevated` + `shadow-card`
- Transisi: `duration-base` `easing`
- Mobile: hamburger → `<Sheet />` full-screen dari atas

**Aturan:**
- Navbar **selalu** varian cinema (gelap). Bahkan di halaman storytelling.
- Jangan modifikasi layout navbar per halaman. Kalau butuh variasi, tambah `variant` baru di sini.

**Server / Client:** Client (butuh scroll listener).

---

### 2.3 `<Footer />`

Footer dengan 3 kolom.

**Props:**
```ts
type FooterProps = {
  variant?: 'public' | 'minimal';
};
```

**Isi:**
- Kolom 1: Logo + tagline
- Kolom 2: Navigasi (Event, Arsip, Tentang)
- Kolom 3: Sosial (Instagram, WhatsApp, Email)
- Baris bawah: `© 2026 NGABINTON. Dibuat sambil ngopi.`

**Aturan:**
- Selalu varian cinema.
- Tidak ada form newsletter (non-goal).

**Server / Client:** Server.

---

### 2.4 `<SectionTransition />`

Gradient pembatas antar section gelap ↔ terang.

**Props:**
```ts
type SectionTransitionProps = {
  from: 'dark' | 'light';
  to: 'dark' | 'light';
  height?: number;   // default 96px
};
```

**Aturan:**
- Dipakai **hanya** di halaman storytelling untuk transisi gelap↔terang.
- Gradient harus seamless: `#141414` → `#f7f5ef` atau sebaliknya.
- Jangan pakai border tebal — biarkan gradient yang bekerja.

**Server / Client:** Server.

---

### 2.5 `<AdminSidebar />`

Sidebar navigasi untuk halaman admin.

**Props:**
```ts
type AdminSidebarProps = {
  currentPath: string;
  user: { displayName: string; role: string };
};
```

**Menu:**
| Label | Route | Icon |
|---|---|---|
| Dashboard | `/admin` | `LayoutDashboard` |
| Event | `/admin/events` | `CalendarDays` |
| Pengaturan | `/admin/settings` | `Settings` |
| Keluar | (action) | `LogOut` |

**Aturan:**
- Mobile: collapse jadi drawer dari kiri.
- Desktop: fixed sidebar 240px.
- Active state: background `surface-hover` + border kiri 2px `primary`.

**Server / Client:** Client (butuh toggle mobile).

---

## 3. Event Components

Lokasi: `src/components/event/`

### 3.1 `<EventHero />`

Hero untuk event badminton (varian cinema).

**Props:**
```ts
type EventHeroProps = {
  event: Event;
  status: 'upcoming' | 'live' | 'past';
};
```

**Layout:**
- Tinggi 80vh desktop / 70vh mobile
- Background: `event.heroImageUrl` + overlay gradient
- Badge volume di kiri atas (mis. "VOL. 12")
- Judul: `display` font Anton
- Metadata bar: tanggal · waktu · lokasi · biaya (dipisah `·`)
- CTA: "Daftar Sekarang" (primary) atau "Presensi Sekarang" (primary + pulse dot) sesuai status
- Tombol ghost: "Lihat Rundown" → scroll `#rundown`

**Aturan:**
- Hanya dipakai untuk event dengan `event_type = 'badminton'` atau `'gathering'`.
- Untuk travel, pakai `<TravelHero />`.

**Server / Client:** Server.

---

### 3.2 `<TravelHero />`

Hero untuk event travel (varian storytelling).

**Props:**
```ts
type TravelHeroProps = {
  event: Event;
  sessionActive?: boolean;
};
```

**Layout:**
- Tinggi 80vh desktop / 90vh mobile
- Background: `event.heroImageUrl`
- Overlay: gradient dari bawah (dark → transparent)
- Badge volume: `caption` uppercase, background putih 15%, teks putih
- Judul: `display` font Anton (mis. "Lan Jalan Vol. 1")
- Subjudul: `heading` (mis. "Walini Hot Spring, Ciwidey")
- Metadata bar: tanggal · waktu · transportasi · biaya
- CTA: "Lihat Rundown" (primary) + "Presensi" (ghost, muncul kalau `sessionActive`)

**Server / Client:** Server.

---

### 3.3 `<EventCard />`

Card untuk carousel event di landing / arsip.

**Props:**
```ts
type EventCardProps = {
  event: Event;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;   // default true
};
```

**Size:**
| Size | Aspect | Lebar |
|---|---|---|
| `sm` | 16:9 | 200px |
| `md` | 16:9 | 280px |
| `lg` | 16:9 | 360px |

**Isi:**
- Poster (aspect 16:9), radius `md`
- Badge volume kiri atas (opsional)
- Judul di bawah poster: `body` weight 600
- Tanggal: `caption` `text-muted`
- Status badge (LIVE / SELESAI / AKAN DATANG) di pojok kanan atas

**Hover (desktop):**
- `scale(1.04)`
- `shadow-card-hover`
- Overlay tipis muncul dengan tombol "Detail" kecil

**Focus keyboard:**
- `outline: 2px solid primary`, offset 2px

**Aturan:**
- Selalu jadi `<Link href={'/' + event.slug}>`.
- Jangan pakai card ini di admin.

**Server / Client:** Client (butuh hover state) — atau pakai CSS-only hover, jadikan Server.

---

### 3.4 `<EventCarousel />`

Row carousel horizontal (Netflix signature).

**Props:**
```ts
type EventCarouselProps = {
  title: string;
  events: Event[];
  seeAllHref?: string;
  variant?: 'cinema';   // hanya cinema untuk sekarang
};
```

**Layout:**
- Judul: `subheading` + link "Lihat semua →" (ghost)
- Container: `overflow-x: auto`, `scroll-snap-type: x mandatory`
- Gap: 16px
- Padding horizontal: 64px desktop / 16px mobile
- Panah navigasi kiri/kanan saat hover (desktop only)

**Empty state:**
- Kalau `events.length === 0`, tampilkan pesan "Belum ada event. Pantengin terus ya!" dengan `text-muted`.

**Aturan:**
- Tepi kiri/kanan diberi gradient fade 48px.
- Scroll-snap per card (`snap-start`).
- Kalau < 3 card, panah disembunyikan.

**Server / Client:** Client (butuh scroll untuk panah).

---

### 3.5 `<EventStatusBadge />`

Badge status event.

**Props:**
```ts
type EventStatusBadgeProps = {
  status: 'upcoming' | 'live' | 'past';
  size?: 'sm' | 'md';
};
```

**Tampilan:**
| Status | Background | Teks | Dot |
|---|---|---|---|
| `upcoming` | Transparan + border `primary` | `primary` | — |
| `live` | `live` 20% opacity | `live` | Ber-pulse |
| `past` | `surface-hover` | `text-muted` | — |

**Aturan:**
- Selalu ada teks, tidak boleh hanya warna (accessibility).
- Dot pulse 2s, matikan kalau `prefers-reduced-motion`.

**Server / Client:** Server.

---

### 3.6 `<EventSubNav />`

Sub-navbar sticky dengan anchor scroll-spy.

**Props:**
```ts
type EventSubNavProps = {
  anchors: { id: string; label: string }[];
  variant?: 'cinema' | 'storytelling';
};
```

**Behavior:**
- Muncul setelah scroll melewati hero (IntersectionObserver pada hero).
- Sticky di bawah navbar utama.
- Active state: underline `primary` / `story-teal`.
- Klik anchor → smooth scroll dengan offset navbar.

**Mobile:**
- Horizontal scroll, `snap-x`.
- Scroll-spy tetap aktif.

**Server / Client:** Client (butuh IntersectionObserver + scroll).

---

### 3.7 `<RundownTimeline />`

Timeline rundown. Dua varian.

**Props:**
```ts
type RundownTimelineProps = {
  items: RundownItem[];
  variant?: 'cinema' | 'storytelling';   // default 'cinema'
  highlightNow?: boolean;                // untuk event live
};
```

**Layout (Cinema):**
- Kolom kiri: waktu `body-sm` `text-subtle`, `tabular-nums`, 100px
- Garis vertikal 1px `border`, dot 8px `primary`
- Kolom kanan: judul `body` weight 600, catatan `body-sm` `text-muted`

**Layout (Storytelling):**
- Kolom kiri: waktu `body-sm` `story-muted`, `tabular-nums`, 100px
- Garis vertikal 1px `story-border`, dot 8px `story-teal`
- Kolom kanan: judul `body` weight 600 `story-text`, catatan `body-sm` `story-muted`
- Item optional: badge kecil `caption` uppercase `story-muted` di samping judul

**Item live (kalau `highlightNow`):**
- Dot ber-pulse `live`
- Border kiri 2px `live`
- Background item `surface` (cinema) / `story-bg-alt` (storytelling)

**Server / Client:** Server.

---

### 3.8 `<EventMediaGallery />`

Grid galeri foto event.

**Props:**
```ts
type EventMediaGalleryProps = {
  media: EventMedia[];
  columns?: 2 | 3 | 4;
};
```

**Layout:**
- Grid dengan gap 8px
- Aspect 1:1 atau 4:5 (pilih satu, konsisten)
- Radius `md`

**Hover:**
- `scale(1.03)` + `shadow-card`

**Lightbox:**
- Klik → lightbox full-screen (pakai `<Dialog />`)

**Aturan:**
- Kalau `media.length === 0`, section disembunyikan (jangan tampil empty state).

**Server / Client:** Client (butuh lightbox state).

---

### 3.9 `<EventMetaBar />`

Baris metadata event (tanggal · waktu · lokasi · biaya).

**Props:**
```ts
type EventMetaBarProps = {
  items: string[];
  separator?: string;   // default '·'
  variant?: 'cinema' | 'storytelling';
};
```

**Tampilan:**
- `caption` uppercase, `letter-spacing: 0.04em`
- Dipisah dengan separator
- Di mobile: bisa wrap ke dua baris kalau kepanjangan

**Server / Client:** Server.

---

## 4. Storytelling Components

Lokasi: `src/components/event/` (tetap di folder yang sama, tapi hanya dipakai di halaman travel).

### 4.1 `<QuranQuote />`

Section ayat Al-Quran + terjemahan.

**Props:**
```ts
type QuranQuoteProps = {
  arabic: string;
  translation: string;
  source: string;   // mis. "Q.S Al Mulk : 15"
};
```

**Layout:**
- Background `story-bg`
- Arab: `font-arabic`, `direction: rtl`, `text-align: center`, line-height 2, warna `story-text`
- Terjemahan: `body-lg` `story-text-secondary`, max-width 65ch, center
- Source: `caption` uppercase `story-muted`, center, dengan garis horizontal kecil di atas-bawah
- Padding vertikal: 96px desktop / 64px mobile

**Accessibility:**
- Wrap dalam `<figure>` + `<figcaption>`
- `<p lang="ar">` untuk arab, `<p lang="id">` untuk terjemahan

**Server / Client:** Server.

---

### 4.2 `<StoryNarrative />`

Section narasi dengan gambar, layout dua kolom alternating.

**Props:**
```ts
type StoryNarrativeProps = {
  title?: string;
  body: string;
  image?: string;
  imageAlt?: string;
  direction?: 'left' | 'right';   // posisi gambar
};
```

**Layout:**
- Desktop: dua kolom (60/40)
- Mobile: satu kolom, gambar di atas teks
- Judul: `heading` `story-text`
- Body: `body-lg` `story-text-secondary`, line-height 1.7
- Gambar: radius `lg`, `shadow-story`

**Server / Client:** Server.

---

### 4.3 `<DestinationCard />`

Card destinasi travel.

**Props:**
```ts
type DestinationCardProps = {
  name: string;
  region: string;
  description: string;
  image: string;
  imageAlt?: string;
  duration?: string;   // mis. "08.30 – 12.15 (≈ 3j 45m)"
  mapsUrl?: string;
};
```

**Layout:**
- Card full-width, background `story-surface`, radius `lg`, `shadow-story`
- Gambar kiri (50%), konten kanan (50%)
- Konten: nama destinasi (`heading`), region (`caption` uppercase `story-teal`), deskripsi (`body`), durasi (badge kecil), tombol "Buka di Maps" (ghost kecil) kalau ada `mapsUrl`

**Mobile:**
- Satu kolom: gambar di atas, konten di bawah.

**Server / Client:** Server.

---

### 4.4 `<TransportCard />`

Card transportasi.

**Props:**
```ts
type TransportCardProps = {
  mode: string;              // mis. "Angkot (sewa)"
  description: string;
  pickupPoints: string[];
  image?: string;
  imageAlt?: string;
};
```

**Layout:**
- Background `story-bg-alt`, radius `lg`, padding 32px
- Icon kendaraan besar (64px) di atas (Lucide `Bus` / `Car`)
- Judul: `heading` (mode)
- Deskripsi: `body`
- List titik jemput: bullet dengan dot `story-orange` 6px
- Foto kendaraan di bawah, aspect 16:9

**Server / Client:** Server.

---

### 4.5 `<BudgetTable />`

Tabel biaya event.

**Props:**
```ts
type BudgetTableProps = {
  items: { label: string; amount: number; isTotal?: boolean }[];
  paymentInfo?: {
    bank: string;
    accountNumber: string;
    accountName: string;
    deadline?: string;
  };
  variant?: 'cinema' | 'storytelling';
};
```

**Layout (Storytelling):**
- Card background `story-surface`, radius `lg`, padding 32px
- Header tabel: kolom `#`, `Item`, `Jumlah` — `caption` uppercase `story-muted`
- Setiap baris: `body`, border-bottom 1px `story-border`
- Baris `isTotal`: `subheading` `story-text`, background `story-bg-alt`, radius `md`, padding tebal
- Angka rupiah: `font-mono` untuk kesan presisi

**Payment Info (opsional):**
- Card kecil di bawah tabel dengan border kiri 4px `story-orange`
- Info rekening + deadline

**Server / Client:** Server.

---

### 4.6 `<GiftExchangeInfo />`

Card info tukar kado.

**Props:**
```ts
type GiftExchangeInfoProps = {
  budgetMin: number;
  budgetMax: number;
  rules: string[];
};
```

**Layout:**
- Card dengan background `story-orange` 15% opacity, border kiri 4px `story-orange`, radius `md`
- Icon 🎁 (Lucide `Gift`) 32px di atas
- Judul: `subheading`
- Budget: `body-lg` weight 600, format rupiah
- Rules: bullet dengan check `story-orange`
- Padding 24px

**Server / Client:** Server.

---

### 4.7 `<ParticipantGrid />`

Grid foto peserta (collage style).

**Props:**
```ts
type ParticipantGridProps = {
  images: { url: string; alt: string }[];
  columns?: 2 | 3 | 4;   // default 4 (desktop)
};
```

**Layout:**
- Grid foto, gap 8px
- Kolom responsif: 4 (desktop), 3 (tablet), 2 (mobile)
- Aspect 1:1 atau 4:5
- Radius `md`

**Hover:**
- `scale(1.03)` + `shadow-card`

**Aturan:**
- Nama peserta TIDAK ditampilkan (privacy default) kecuali diminta eksplisit.

**Server / Client:** Server.

---

### 4.8 `<ClosingMessage />`

Pesan penutup dengan font script.

**Props:**
```ts
type ClosingMessageProps = {
  text: string;         // mis. "See you in the ANGKOT!"
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
};
```

**Layout:**
- Background `story-bg`
- Font `script` (Caveat) besar, warna `story-script`, center
- Subtitle opsional: `body` `story-muted`, center
- CTA ghost di bawah

**Aturan:**
- Font script **hanya dipakai di sini** (dan mungkin 1 tempat lain). Jangan berlebihan.

**Server / Client:** Server.

---

## 5. Presensi Components

Lokasi: `src/components/presensi/`

### 5.1 `<AttendanceForm />`

Form presensi peserta.

**Props:**
```ts
type AttendanceFormProps = {
  sessionCode: string;
  eventSlug: string;
  requiresGift?: boolean;   // untuk travel
};
```

**Fields:**
- Nama lengkap (wajib) — placeholder "Nama kamu"
- Nomor HP (opsional) — placeholder "08xx"
- Bawa kado? (checkbox, muncul kalau `requiresGift = true`)

**Submit:**
- Pakai Server Action `submitAttendanceAction`
- `useFormState` untuk handle response
- Loading state: tombol disabled + spinner

**State handling:**
| Hasil | Tampilan |
|---|---|
| Sukses | Redirect ke state sukses (pakai `<AttendanceSuccess />`) |
| Duplikat | Tampilkan `<AttendanceDuplicate />` dengan waktu sebelumnya |
| Sesi tutup | Tampilkan pesan "Presensi sudah ditutup" |
| Kode invalid | Tampilkan form input manual untuk kode |

**Validasi:**
- Nama minimal 2 karakter
- Nomor HP (kalau diisi) minimal 10 digit

**Server / Client:** Client (butuh form state).

---

### 5.2 `<AttendanceSuccess />`

Feedback sukses presensi.

**Props:**
```ts
type AttendanceSuccessProps = {
  name: string;
  checkedInAt: Date;
  eventTitle: string;
};
```

**Layout:**
- Card full-width (max 480px)
- Icon check besar (48px) warna `live`
- Teks "Kehadiran kamu tercatat" `heading`
- Nama peserta `subheading`
- Waktu `body-sm` `text-muted`
- CTA "Kembali ke Event" ghost

**Server / Client:** Server.

---

### 5.3 `<AttendanceDuplicate />`

Feedback kalau sudah pernah absen.

**Props:**
```ts
type AttendanceDuplicateProps = {
  name: string;
  checkedInAt: Date;
};
```

**Layout:**
- Card dengan border kiri 4px `warning`
- Icon warning 32px `warning`
- Teks "Kamu sudah tercatat hadir sebelumnya"
- Waktu absen sebelumnya
- Tidak ada CTA (atau CTA "Kembali" saja)

**Server / Client:** Server.

---

### 5.4 `<QrDisplay />`

QR code display untuk admin.

**Props:**
```ts
type QrDisplayProps = {
  sessionCode: string;
  eventSlug: string;
  isActive: boolean;
  size?: 'md' | 'lg';   // default 'lg'
};
```

**Layout:**
- Card `surface`, padding 32px, radius `xl`
- Badge status di atas (LIVE / TUTUP)
- QR code: background putih dengan padding 24px
  - Desktop: 320×320
  - Mobile: 240×240
- URL pendek di bawah QR (`font-mono`, bisa copy)
- Tombol: "Refresh QR", "Unduh PNG", "Tutup Presensi"

**QR Generation:**
- Pakai library `qrcode` di Server Component
- Atau ambil dari `/api/qr/[sessionId]` untuk download

**Server / Client:** Server (QR di-generate server) + Client wrapper untuk tombol.

---

### 5.5 `<QrScanner />`

QR scanner untuk peserta (client only).

**Props:**
```ts
type QrScannerProps = {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
};
```

**Layout:**
- Full-screen camera view
- Overlay viewfinder: kotak transparan dengan corner border merah
- Teks panduan: "Arahkan kamera ke QR code"
- Tombol fallback: "Masukkan kode manual" → input 6-digit

**Library:** `html5-qrcode`

**Aturan:**
- Wajib HTTPS (Vercel sudah).
- Handle error: permission denied, kamera tidak ada, QR tidak terbaca.
- Fallback input manual wajib ada.
- Cleanup saat unmount: stop kamera & clear interval.

**Server / Client:** Client.

---

### 5.6 `<AttendanceTable />`

Tabel kehadiran admin.

**Props:**
```ts
type AttendanceTableProps = {
  sessionId: string;
  initialData: Attendance[];
};
```

**Kolom:**
| # | Kolom | Lebar |
|---|---|---|
| 1 | No | 60px |
| 2 | Nama | auto |
| 3 | No. HP | 140px |
| 4 | Bawa Kado | 100px (kalau travel) |
| 5 | Waktu | 120px |
| 6 | Aksi | 80px |

**Realtime:**
- Stream via Server-Sent Events `GET /api/attendance/stream/[sessionId]` (admin-protected)
- Insert baru → prepend ke list + highlight 1.5s dengan `rgba(34,197,94,0.15)`

**Filter:**
- Dropdown: Semua / Bawa Kado / Belum Bawa (kalau travel)
- Search by nama

**Empty state:**
- "Belum ada yang absen. Jadi yang pertama!" `text-muted`

**Server / Client:** Client (realtime + filter).

---

### 5.7 `<AttendanceCounter />`

Counter kehadiran realtime (untuk halaman QR).

**Props:**
```ts
type AttendanceCounterProps = {
  sessionId: string;
  initialCount: number;
  quota?: number | null;
};
```

**Layout:**
- Angka besar: `display-sm` (mis. "42")
- Label: `caption` uppercase "orang sudah hadir"
- Kalau ada quota: progress bar tipis di bawah + teks "42 / 50"

**Realtime:**
- Stream via Server-Sent Events `GET /api/attendance/stream/[sessionId]` → update count + nama terakhir yang absen
- Tampilkan nama terakhir dengan fade-in

**Fallback:**
- Kalau SSE gagal >5s, fallback ke polling `GET /api/attendance/stream/[sessionId]?mode=polling` setiap 10s.

**Server / Client:** Client.

---

## 6. Admin Components

Lokasi: `src/components/admin/`

### 6.1 `<StatCard />`

Card statistik di dashboard.

**Props:**
```ts
type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; direction: 'up' | 'down' };
};
```

**Layout:**
- Card `surface`, padding 24px, radius `lg`
- Icon 24px di pojok kanan atas (`text-muted`)
- Angka: `display-sm` (mis. "42")
- Label: `caption` uppercase `text-muted`

**Server / Client:** Server.

---

### 6.2 `<EventForm />`

Form buat/edit event.

**Props:**
```ts
type EventFormProps = {
  mode: 'create' | 'edit';
  initialData?: Event;
  onSuccess?: (id: string) => void;
};
```

**Fields:**
- Judul (wajib)
- Subjudul
- Slug (auto-generated dari judul, bisa override)
- Tipe event (radio: badminton / travel / gathering)
- Tema (radio: cinema / storytelling)
- Tanggal & waktu mulai (wajib)
- Tanggal & waktu selesai
- Lokasi
- Titik kumpul (kalau travel)
- Jam kumpul (kalau travel)
- Jam pulang (kalau travel)
- Transportasi (kalau travel)
- Biaya
- Kuota
- Hero image (upload)
- Cover image (upload)
- Publish? (checkbox)
- Featured? (checkbox)

**Aturan:**
- Fields travel hanya muncul kalau `event_type === 'travel'`.
- Upload pakai `<FileUpload />` (komponen baru, lihat 6.5).
- Validasi Zod sebelum submit.

**Server / Client:** Client.

---

### 6.3 `<RundownEditor />`

Editor rundown dengan drag & drop.

**Props:**
```ts
type RundownEditorProps = {
  eventId: string;
  initialItems: RundownItem[];
};
```

**Layout:**
- List item dengan handle drag di kiri
- Setiap item: input waktu, input judul, input catatan, checkbox optional
- Tombol hapus per item
- Tombol "+ Tambah Item" di bawah

**Library drag:**
- `@dnd-kit/core` + `@dnd-kit/sortable`

**Simpan:**
- Tombol "Simpan" → panggil `saveRundownAction`
- Atau auto-save saat blur (pilih salah satu, konsisten)

**Server / Client:** Client.

---

### 6.4 `<EventTable />`

Tabel daftar event di admin.

**Props:**
```ts
type EventTableProps = {
  events: Event[];
};
```

**Kolom:**
| # | Kolom |
|---|---|
| 1 | Judul |
| 2 | Tipe |
| 3 | Tanggal |
| 4 | Status (Draft / Publish) |
| 5 | Aksi (Edit, QR, Presensi, Hapus) |

**Aksi:**
- Klik baris → buka detail
- Tombol QR → `/admin/events/[id]/qr`
- Tombol Presensi → `/admin/events/[id]/attendance`

**Server / Client:** Server + Client untuk aksi.

---

### 6.5 `<FileUpload />`

Upload file ke Supabase Storage.

**Props:**
```ts
type FileUploadProps = {
  accept?: string;   // default "image/*"
  maxSize?: number;  // default 5 * 1024 * 1024 (5MB)
  value?: string;    // URL existing
  onChange: (url: string) => void;
};
```

**Behavior:**
- Drag & drop area
- Preview setelah upload
- Convert ke WebP di server (pakai `sharp`)

**Aturan:**
- Max 5MB
- Format: JPG, PNG, WebP

**Server / Client:** Client.

---

### 6.6 `<LoginForm />`

Form login admin.

**Props:**
```ts
type LoginFormProps = {
  redirectTo?: string;   // tujuan setelah login sukses (dari param redirect)
};
```

**Isi (CONTENT.md §5.1):**
- Field `username` — placeholder "username"
- Field `password` — placeholder "••••••••"
- Tombol "Masuk" (disabled + "Memuat..." saat pending)
- Pesan error auth dengan `aria-live="polite"`

**Cara kerja:**
- Pakai `useActionState` (React 19) + Server Action `loginAction`
- Sukses → Server Action redirect ke `/admin`

**Server / Client:** Client.

---

## 7. UI Primitives (shadcn)

Lokasi: `src/components/ui/`

**Prinsip:** semua primitives dari shadcn, di-styling ulang pakai token `DESIGN.md`. Jangan bikin button/input custom kalau shadcn sudah ada.

### 7.1 Daftar Primitives

| Komponen | Dipakai untuk | Custom? |
|---|---|---|
| `<Button />` | Semua tombol | Ya — variant `primary`, `ghost`, `outline`, `danger` |
| `<Input />` | Text input, email, phone | Ya — token styling |
| `<Label />` | Label form | Tidak |
| `<Textarea />` | Textarea | Ya |
| `<Checkbox />` | Checkbox | Ya |
| `<RadioGroup />` | Radio (tipe event) | Tidak |
| `<Select />` | Dropdown | Tidak |
| `<Card />` | Card container | Tidak |
| `<Badge />` | Badge status | Ya — variant live, volume, optional, closed |
| `<Dialog />` | Modal | Ya — styling |
| `<Sheet />` | Drawer (mobile navbar) | Ya |
| `<Toast />` | Notifikasi | Ya |
| `<Skeleton />` | Loading placeholder | Tidak |
| `<Spinner />` | Loading spinner | Ya |
| `<Tabs />` | Tab (detail event admin) | Tidak |

### 7.2 Variant `<Button />`

```ts
type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
```

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| `primary` | `primary` | `on-primary` | — | brightness 1.1 |
| `ghost` | transparan | `text` | `border-strong` | bg `surface-hover` |
| `outline` | transparan | `text` | `border-strong` | bg `surface-hover` |
| `danger` | transparan | `danger` | `danger` | bg `danger` 10% |

**Size:**
| Size | Padding | Font |
|---|---|---|
| `sm` | 8px 16px | `body-sm` |
| `md` | 12px 24px | `body` |
| `lg` | 16px 32px | `body-lg` |
| `icon` | 44×44px | — |

**Aturan:**
- Dalam satu section, **hanya satu** tombol `primary`.
- Tombol `icon` minimal 44×44px (touch target).

---

## 8. Komponen yang DILARANG Dibuat

Agent jangan bikin komponen ini — di luar scope atau overkill:

- ❌ `<Carousel3D />` — cukup 2D carousel
- ❌ `<AnimatedBackground />` — background statis cukup
- ❌ `<ConfettiExplosion />` — tidak sesuai tone
- ❌ `<ChatWidget />` — non-goal
- ❌ `<CookieConsent />` — tidak pakai analytics tracking
- ❌ `<Newsletter />` — non-goal
- ❌ `<DarkModeToggle />` — varian sudah ditentukan per halaman
- ❌ `<LanguageSwitcher />` — hanya Bahasa Indonesia
- ❌ `<SearchBar />` di landing — belum butuh
- ❌ `<CommentSection />` — non-goal
- ❌ `<RatingStars />` — non-goal

---

## 9. Checklist Sebelum Bikin Komponen Baru

Sebelum membuat komponen baru, agent wajib cek:

- [ ] Komponen sudah ada di daftar ini?
- [ ] Kalau ada, apakah bisa extend dengan props?
- [ ] Kalau tidak ada, apakah benar-benar dibutuhkan?
- [ ] Sudah update `COMPONENTS.md` dulu (tambah entri)?
- [ ] Props pakai type dari `lib/types/`?
- [ ] Styling pakai token dari `DESIGN.md`?
- [ ] Server Component dulu, baru `"use client"` kalau perlu?
- [ ] File < 200 baris?
- [ ] Tidak ada `any` di props?

Kalau semua ✅, baru implementasi.

---

## 10. Referensi Cepat

| Butuh… | Lihat section |
|---|---|
| Layout | 2 |
| Event umum | 3 |
| Storytelling | 4 |
| Presensi | 5 |
| Admin | 6 |
| UI primitives | 7 |
| Yang dilarang | 8 |
| Checklist | 9 |

---

**Versi:** 1.0
**Terakhir diperbarui:** [tanggal]
**Pemilik:** Tim NGABINTON
