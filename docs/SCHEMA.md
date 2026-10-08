# `SCHEMA.md`

# SCHEMA — NGABINTON

> **Sumber kebenaran untuk model data.**
> Setiap perubahan skema wajib update file ini + migration Drizzle.
> Agent DILARANG menambah kolom/tabel tanpa update SCHEMA.md.

---

## 0. Ringkasan Cepat (TL;DR)

```yaml
Tabel: 8
- users               → admin & pengurus
- events              → semua event (badminton & travel)
- rundown_items       → item rundown per event
- budget_items        → rincian biaya per event
- event_media         → foto & aset per event
- event_extras        → key-value fleksibel per event (ayat, aturan kado, dll)
- attendance_sessions → sesi presensi (buka-tutup) per event
- attendances         → catatan kehadiran peserta

Enum:
- user_role:          admin | superadmin
- event_type:         badminton | travel | gathering
- event_theme:        cinema | storytelling
- media_type:         destination | food | transport | participant | gallery | poster
```

---

## 1. Entity Relationship Diagram

```
users ──┬── created_events ──► events
        └── created_sessions ─► attendance_sessions

events ─┬── rundown_items
        ├── budget_items
        ├── event_media
        ├── event_extras
        └── attendance_sessions ──► attendances
```

Relasi:
- `events` 1—N `rundown_items` (cascade delete)
- `events` 1—N `budget_items` (cascade delete)
- `events` 1—N `event_media` (cascade delete)
- `events` 1—N `event_extras` (cascade delete)
- `events` 1—N `attendance_sessions` (cascade delete)
- `attendance_sessions` 1—N `attendances` (cascade delete)
- `users` 1—N `events` (created_by, no cascade — kalau user dihapus, event tetap ada)
- `users` 1—N `attendance_sessions` (created_by)

---

## 2. Enums

```ts
// lib/db/schema.ts
import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'superadmin',
]);

export const eventTypeEnum = pgEnum('event_type', [
  'badminton',
  'travel',
  'gathering',
]);

export const eventThemeEnum = pgEnum('event_theme', [
  'cinema',        // dark, Netflix-style (default untuk badminton)
  'storytelling',  // terang, majalah-style (untuk travel)
]);

export const mediaTypeEnum = pgEnum('media_type', [
  'poster',        // poster utama event
  'destination',   // foto destinasi (travel)
  'food',          // foto makanan (travel)
  'transport',     // foto transportasi (travel)
  'participant',   // foto peserta
  'gallery',       // galeri umum
]);
```

---

## 3. Tabel Detail

### 3.1 `users`

Admin & pengurus yang bisa login ke dashboard.

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `id` | `serial` | PK | Auto increment |
| `username` | `text` | UNIQUE, NOT NULL | Login identifier |
| `password_hash` | `text` | NOT NULL | bcrypt hash (cost 10) |
| `display_name` | `text` | NOT NULL | Nama yang ditampilkan di dashboard |
| `role` | `user_role` | NOT NULL, default `'admin'` | Hak akses |
| `is_active` | `boolean` | NOT NULL, default `true` | Nonaktifkan tanpa hapus |
| `last_login_at` | `timestamptz` | NULL | Terakhir login |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | — |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | — |

**Indexes:**
- `users_username_unique` (UNIQUE)

**Aturan:**
- `password_hash` **jangan pernah** kirim ke client.
- `role` = `superadmin` bisa kelola admin lain. `admin` hanya kelola event.
- Untuk sementara, semua admin punya role `admin`. `superadmin` di-reserve.

```ts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  role: userRoleEnum('role').notNull().default('admin'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

---

### 3.2 `events`

Semua event: badminton, travel, gathering.

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | — |
| `slug` | `text` | UNIQUE, NOT NULL | URL identifier (mis. `lanjalan-vol-1`) |
| `title` | `text` | NOT NULL | Judul utama |
| `subtitle` | `text` | NULL | Subjudul (mis. "Walini Hot Spring, Ciwidey") |
| `description` | `text` | NULL | Deskripsi panjang (markdown) |
| `event_type` | `event_type` | NOT NULL | `badminton` / `travel` / `gathering` |
| `theme` | `event_theme` | NOT NULL, default `'cinema'` | Varian visual |
| `hero_image_url` | `text` | NULL | Foto hero |
| `cover_image_url` | `text` | NULL | Foto cover (untuk OG image / card) |
| `starts_at` | `timestamptz` | NOT NULL | Tanggal & waktu mulai |
| `ends_at` | `timestamptz` | NULL | Tanggal & waktu selesai |
| `meeting_point` | `text` | NULL | Titik kumpul (travel) |
| `meeting_time` | `text` | NULL | Jam kumpul (mis. "06.00 WIB") |
| `return_time` | `text` | NULL | Jam pulang (mis. "18.00 WIB") |
| `location` | `text` | NULL | Nama lokasi utama |
| `location_url` | `text` | NULL | Google Maps URL |
| `transport_mode` | `text` | NULL | Mode transport (mis. "Angkot (sewa)") |
| `price` | `integer` | NULL | Harga per orang (dalam rupiah) |
| `quota` | `integer` | NULL | Kuota peserta |
| `is_published` | `boolean` | NOT NULL, default `false` | Tampil di public? |
| `is_featured` | `boolean` | NOT NULL, default `false` | Tampil di hero? |
| `created_by` | `integer` | FK → users.id, NULL | Siapa yang buat |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | — |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | — |

**Indexes:**
- `events_slug_unique` (UNIQUE)
- `events_published_starts_idx` pada `(is_published, starts_at DESC)`
- `events_type_idx` pada `(event_type)`

**Aturan:**
- `slug` immutable — jangan pernah diubah setelah publish (breaking link).
- `slug` harus lowercase, hanya `a-z`, `0-9`, dan `-`. Generate via `lib/utils/slug.ts`.
- `theme` default `cinema` untuk badminton, `storytelling` untuk travel. Admin bisa override.
- Kalau `is_published = false`, halaman `/[slug]` return 404.
- `price` simpan dalam integer rupiah (jangan float, jangan cent).

```ts
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  eventType: eventTypeEnum('event_type').notNull(),
  theme: eventThemeEnum('theme').notNull().default('cinema'),
  heroImageUrl: text('hero_image_url'),
  coverImageUrl: text('cover_image_url'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  meetingPoint: text('meeting_point'),
  meetingTime: text('meeting_time'),
  returnTime: text('return_time'),
  location: text('location'),
  locationUrl: text('location_url'),
  transportMode: text('transport_mode'),
  price: integer('price'),
  quota: integer('quota'),
  isPublished: boolean('is_published').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  publishedStartsIdx: index('events_published_starts_idx').on(t.isPublished, t.startsAt.desc()),
  typeIdx: index('events_type_idx').on(t.eventType),
}));
```

---

### 3.3 `rundown_items`

Item rundown per event. Contoh: "06.00 Kumpul di Vasati Rabbani".

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `id` | `serial` | PK | — |
| `event_id` | `uuid` | FK → events.id, NOT NULL, CASCADE | — |
| `order` | `integer` | NOT NULL | Urutan tampil (0-based) |
| `time` | `text` | NOT NULL | Jam (mis. "06.00" atau "06.00 – 08.30") |
| `title` | `text` | NOT NULL | Nama aktivitas |
| `note` | `text` | NULL | Catatan tambahan |
| `is_optional` | `boolean` | NOT NULL, default `false` | Tandai sebagai optional |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | — |

**Indexes:**
- `rundown_event_order_unique` (UNIQUE pada `event_id`, `order`)
- `rundown_event_idx` pada `(event_id, order ASC)`

**Aturan:**
- `time` disimpan sebagai text, bukan `time` type. Alasan: format bisa fleksibel ("06.00 – 08.30", "Setelah makan", dll).
- `order` unik per event. Kalau mau sisipkan item, re-order semua item setelahnya.
- Reorder via Server Action yang menerima array `[{id, order}]`.

```ts
export const rundownItems = pgTable('rundown_items', {
  id: serial('id').primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  time: text('time').notNull(),
  title: text('title').notNull(),
  note: text('note'),
  isOptional: boolean('is_optional').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  eventOrderUnique: uniqueIndex('rundown_event_order_unique').on(t.eventId, t.order),
  eventIdx: index('rundown_event_idx').on(t.eventId, t.order),
}));
```

---

### 3.4 `budget_items`

Rincian biaya per event. Contoh: "Angkot Rp 50.000".

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `id` | `serial` | PK | — |
| `event_id` | `uuid` | FK → events.id, NOT NULL, CASCADE | — |
| `order` | `integer` | NOT NULL | Urutan tampil |
| `label` | `text` | NOT NULL | Nama item (mis. "Angkot") |
| `amount` | `integer` | NOT NULL | Jumlah dalam rupiah |
| `is_total` | `boolean` | NOT NULL, default `false` | Baris total? |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | — |

**Indexes:**
- `budget_event_order_unique` (UNIQUE pada `event_id`, `order`)

**Aturan:**
- Kalau `is_total = true`, biasanya `label = 'TOTAL'` dan `amount` = sum dari baris lain.
- Kalau ada baris total, tampilkan sebagai baris terakhir dengan styling berbeda.

```ts
export const budgetItems = pgTable('budget_items', {
  id: serial('id').primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  label: text('label').notNull(),
  amount: integer('amount').notNull(),
  isTotal: boolean('is_total').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  eventOrderUnique: uniqueIndex('budget_event_order_unique').on(t.eventId, t.order),
}));
```

---

### 3.5 `event_media`

Foto & aset per event. Satu event bisa punya banyak media.

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `id` | `serial` | PK | — |
| `event_id` | `uuid` | FK → events.id, NOT NULL, CASCADE | — |
| `type` | `media_type` | NOT NULL | Kategori media |
| `url` | `text` | NOT NULL | URL (Supabase Storage / public/) |
| `alt` | `text` | NULL | Alt text untuk aksesibilitas |
| `caption` | `text` | NULL | Caption opsional |
| `order` | `integer` | NOT NULL, default `0` | Urutan tampil |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | — |

**Indexes:**
- `media_event_type_idx` pada `(event_id, type, order ASC)`

**Aturan:**
- Untuk hero & cover, tetap disimpan di `events.hero_image_url` dan `events.cover_image_url` (bukan di sini). Tabel ini untuk media tambahan.
- Untuk `type = 'participant'`, ini foto collage peserta.
- Untuk `type = 'destination'`, foto destinasi travel.
- Untuk `type = 'food'`, foto makanan.

```ts
export const eventMedia = pgTable('event_media', {
  id: serial('id').primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  type: mediaTypeEnum('type').notNull(),
  url: text('url').notNull(),
  alt: text('alt'),
  caption: text('caption'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  eventTypeIdx: index('media_event_type_idx').on(t.eventId, t.type, t.order),
}));
```

---

### 3.6 `event_extras`

Key-value fleksibel untuk hal-hal spesifik event yang tidak layak jadi kolom.

Contoh:
- Ayat Quran untuk Lan Jalan Vol. 1
- Aturan tukar kado
- Info rekening pembayaran
- Catatan panitia

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `id` | `serial` | PK | — |
| `event_id` | `uuid` | FK → events.id, NOT NULL, CASCADE | — |
| `key` | `text` | NOT NULL | Identifier (mis. `quran_verse`) |
| `value` | `jsonb` | NOT NULL | Data (bisa string, object, array) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | — |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | — |

**Indexes:**
- `extras_event_key_unique` (UNIQUE pada `event_id`, `key`)

**Keys yang dipakai saat ini:**

| Key | Struktur `value` | Dipakai di |
|---|---|---|
| `quran_verse` | `{ arabic, translation, source }` | Section pembuka (travel) |
| `gift_exchange` | `{ budget_min, budget_max, rules: string[] }` | Section tukar kado |
| `payment_info` | `{ bank, account_number, account_name, deadline }` | Section biaya |
| `narrative` | `{ title, body }` | Section narasi |
| `pickup_points` | `string[]` | Section transportasi |

**Aturan:**
- Jangan pakai `event_extras` untuk data yang jelas-jelas butuh kolom sendiri. Gunakan hanya untuk data opsional yang hanya muncul di sebagian event.
- Setiap key baru → update tabel di atas.

```ts
export const eventExtras = pgTable('event_extras', {
  id: serial('id').primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  eventKeyUnique: uniqueIndex('extras_event_key_unique').on(t.eventId, t.key),
}));
```

---

### 3.7 `attendance_sessions`

Sesi presensi. Satu event bisa punya beberapa sesi (mis. hari 1, hari 2).

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | — |
| `event_id` | `uuid` | FK → events.id, NOT NULL, CASCADE | — |
| `session_code` | `text` | UNIQUE, NOT NULL | 6 char uppercase, fallback input manual |
| `label` | `text` | NULL | Label opsional (mis. "Hari 1") |
| `is_active` | `boolean` | NOT NULL, default `false` | Sedang dibuka? |
| `opened_at` | `timestamptz` | NULL | Kapan dibuka |
| `closed_at` | `timestamptz` | NULL | Kapan ditutup |
| `auto_close_at` | `timestamptz` | NULL | Auto-close (opsional) |
| `created_by` | `integer` | FK → users.id, NULL | Admin yang buat |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | — |

**Indexes:**
- `sessions_code_unique` (UNIQUE)
- `sessions_active_event_idx` pada `(event_id, is_active)`

**Aturan:**
- Hanya **satu sesi aktif per event** (invariant — enforce di Server Action, lihat `RULES.md` §10.3).
- `session_code` unik **global** (bukan per event).
- Sesi yang sudah `closed` **tidak bisa** dibuka ulang — bikin sesi baru.
- `auto_close_at` dievaluasi *lazy* saat request masuk (bukan cron).

```ts
export const attendanceSessions = pgTable('attendance_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  sessionCode: text('session_code').notNull().unique(),
  label: text('label'),
  isActive: boolean('is_active').notNull().default(false),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  autoCloseAt: timestamp('auto_close_at', { withTimezone: true }),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  codeUnique: uniqueIndex('sessions_code_unique').on(t.sessionCode),
  activeEventIdx: index('sessions_active_event_idx').on(t.eventId, t.isActive),
}));
```

---

### 3.8 `attendances`

Catatan kehadiran peserta per sesi. Satu sesi bisa punya banyak baris.

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | — |
| `session_id` | `uuid` | FK → attendance_sessions.id, NOT NULL, CASCADE | Sesi presensi |
| `name` | `text` | NOT NULL | Nama peserta (2–100 char) |
| `phone` | `text` | NULL | No. HP **ternormalisasi** (10–15 digit) |
| `email` | `text` | NULL | Email opsional |
| `organization` | `text` | NULL | Instansi/komunitas opsional |
| `brings_gift` | `boolean` | NOT NULL, default `false` | Khusus travel + tukar kado |
| `ip_hash` | `text` | NULL | `sha256(ip + AUTH_SECRET)` — **jangan simpan IP mentah** |
| `user_agent` | `text` | NULL | Untuk debugging (tidak ditampilkan) |
| `checked_in_at` | `timestamptz` | NOT NULL, default `now()` | Waktu hadir |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | — |

**Indexes:**
- `attendances_session_idx` pada `(session_id, checked_in_at ASC)`
- `attendances_session_phone_unique` — UNIQUE parcial pada `(session_id, phone)` **hanya saat `phone IS NOT NULL`**
- `attendances_session_name_ip_idx` pada `(session_id, name, ip_hash)`

**Aturan:**
- Duplikat dideteksi: `(session_id, phone)` bila `phone` diisi; jika tidak, `(session_id, name, ip_hash)`. Lihat `RULES.md` §3.3.
- `phone` dinormalisasi sebelum simpan (hapus spasi/`-`/`+`; prefix `62` → `0`).
- `name` wajib (min 2, max 100). `phone` (kalau diisi) 10–15 digit.
- `brings_gift` hanya relevan untuk event travel dengan fitur tukar kado.
- `email` & `organization` **belum dipakai di UI** (form M6 hanya nama + phone + brings_gift) — di-reserve untuk kolom CSV (`ROUTES.md` §4.3).

```ts
export const attendances = pgTable('attendances', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => attendanceSessions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  organization: text('organization'),
  bringsGift: boolean('brings_gift').notNull().default(false),
  ipHash: text('ip_hash'),
  userAgent: text('user_agent'),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  sessionIdx: index('attendances_session_idx').on(t.sessionId, t.checkedInAt),
  sessionPhoneUnique: uniqueIndex('attendances_session_phone_unique')
    .on(t.sessionId, t.phone)
    .where(sql`${t.phone} IS NOT NULL`),
  sessionNameIpIdx: index('attendances_session_name_ip_idx').on(t.sessionId, t.name, t.ipHash),
}));
```

**Imports `schema.ts` (referensi lengkap):**
```ts
import {
  pgTable, pgEnum, serial, integer, text, boolean, timestamp, uuid, jsonb,
  index, uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
```

---

## 4. Relations (Drizzle `relations`)

Dipakai untuk query relasional (`db.query.*.findMany({ with: {...} })`).

```ts
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  sessions: many(attendanceSessions),
}));

export const eventsRelations = relations(events, ({ many, one }) => ({
  rundownItems: many(rundownItems),
  budgetItems: many(budgetItems),
  media: many(eventMedia),
  extras: many(eventExtras),
  sessions: many(attendanceSessions),
  createdByUser: one(users, { fields: [events.createdBy], references: [users.id] }),
}));

export const rundownItemsRelations = relations(rundownItems, ({ one }) => ({
  event: one(events, { fields: [rundownItems.eventId], references: [events.id] }),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  event: one(events, { fields: [budgetItems.eventId], references: [events.id] }),
}));

export const eventMediaRelations = relations(eventMedia, ({ one }) => ({
  event: one(events, { fields: [eventMedia.eventId], references: [events.id] }),
}));

export const eventExtrasRelations = relations(eventExtras, ({ one }) => ({
  event: one(events, { fields: [eventExtras.eventId], references: [events.id] }),
}));

export const attendanceSessionsRelations = relations(attendanceSessions, ({ one, many }) => ({
  event: one(events, { fields: [attendanceSessions.eventId], references: [events.id] }),
  createdByUser: one(users, { fields: [attendanceSessions.createdBy], references: [users.id] }),
  attendances: many(attendances),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  session: one(attendanceSessions, { fields: [attendances.sessionId], references: [attendanceSessions.id] }),
}));
```

---

## 5. Query Helpers (`lib/api/`)

Semua query **baca** ditempatkan di `lib/api/`. Komponen **dilarang** fetch/akses DB langsung (`AGENTS.md` §3.2 poin 6).

### 5.1 Event Detail

**`getEventBySlug(slug: string)`** — `lib/api/events.ts`

Mengembalikan event + relasi lengkap, hanya yang `is_published = true` (selain itu `null` → `notFound()`).

```ts
const event = await db.query.events.findFirst({
  where: and(eq(events.slug, slug), eq(events.isPublished, true)),
  with: {
    rundownItems: { orderBy: [asc(rundownItems.order)] },
    budgetItems: { orderBy: [asc(budgetItems.order)] },
    media: { orderBy: [asc(eventMedia.order)] },
    extras: true,
    sessions: { where: eq(attendanceSessions.isActive, true), limit: 1 },
  },
});
```

### 5.2 Event List

- **`getUpcomingEvents(limit = 12)`** → `is_published = true AND starts_at > now()`, order `starts_at ASC`.
- **`getPastEvents(limit = 12)`** → `is_published = true AND starts_at < now()`, order `starts_at DESC`.
- **`getFeaturedEvent()`** → `is_featured = true AND is_published = true`, limit 1.
- **`getTravelArchive(limit = 12)`** → `event_type = 'travel'` + `is_published` + sudah lewat.

### 5.3 Rundown & Budget

- **`getRundown(eventId)`** → item order `ASC`.
- **`getBudget(eventId)`** → item order `ASC` (termasuk baris `is_total`).

### 5.4 Media & Extras

- **`getEventMedia(eventId, type?)`** → filter by `type`, order `ASC`.
- **`getEventExtras(eventId)`** → dikembalikan sebagai map `key → value` (jsonb di-parse).
- **`getExtra(eventId, key)`** → satu nilai (mis. `quran_verse`, `gift_exchange`, `payment_info`).

### 5.5 Attendance & Session

Dipakai `actions/attendance.ts` (lihat `ROUTES.md` §3.5).

- **`getActiveSession(eventId)`** → sesi `is_active = true` (maks 1).
- **`getSessionByCode(code)`** → cari sesi dari `session_code`.
- **`getAttendancesBySession(sessionId)`** → order `checked_in_at ASC`.
- **`countAttendances(sessionId)`** → untuk counter realtime.
- **`createSession(eventId, createdBy, autoCloseAt?)`**, **`closeSession(sessionId)`**, **`refreshSessionCode(sessionId)`** → dipakai Server Actions.

**Aturan query:**
1. Selalu pakai instance dari `lib/db/client.ts` — jangan bikin koneksi baru.
2. Query publik **wajib** filter `is_published = true` (kecuali konteks admin).
3. Jangan `select *` untuk data sensitif (`users.password_hash`, `attendances.ip_hash`).
4. Query realtime via Supabase Channels **terpisah** dari query server — lihat `ARCHITECTURE.md` ADR-005.

---

**Versi:** 1.0
**Terakhir diperbarui:** 2026-10-08
**Pemilik:** Tim NGABINTON
- `sessions_event_active_idx` pada `(event_id, is_active)`

**Aturan:**
- `session_code`: 6 karakter, uppercase, alphanumeric **tanpa** karakter ambigu (no `0/O`, `1/I/L`). Charset: `ABCDEFGHJKMNPQRSTUVWXYZ23456789`.
- Hanya boleh ada **satu sesi aktif** per event. Kalau buka sesi baru, sesi lama harus ditutup dulu.
- `auto_close_at` diisi kalau admin set durasi. Kalau NULL, sesi hanya ditutup manual.
- QR code di-generate dari `session_code` + `event.slug`: URL `/e/{slug}/absen?code={session_code}`.

```ts
export const attendanceSessions = pgTable('attendance_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  sessionCode: text('session_code').notNull().unique(),
  label: text('label'),
  isActive: boolean('is_active').notNull().default(false),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  autoCloseAt: timestamp('auto_close_at', { withTimezone: true }),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  eventActiveIdx: index('sessions_event_active_idx').on(t.eventId, t.isActive),
}));
```

---

### 3.8 `attendances`

Catatan kehadiran peserta. Satu baris = satu peserta yang absen.

| Kolom | Tipe | Constraint | Deskripsi |
|---|---|---|---|
| `id` | `serial` | PK | — |
| `session_id` | `uuid` | FK → attendance_sessions.id, NOT NULL, CASCADE | — |
| `name` | `text` | NOT NULL | Nama peserta |
| `phone` | `text` | NULL | Nomor HP (opsional) |
| `email` | `text` | NULL | Email (opsional) |
| `organization` | `text` | NULL | Instansi/komunitas (opsional) |
| `brings_gift` | `boolean` | NOT NULL, default `false` | Bawa kado? (khusus travel) |
| `checked_in_at` | `timestamptz` | NOT NULL, default `now()` | Waktu absen |
| `ip_hash` | `text` | NULL | SHA-256 dari IP (untuk anti-duplikat) |
| `user_agent` | `text` | NULL | Untuk debugging |

**Indexes:**
- `attendances_session_time_idx` pada `(session_id, checked_in_at DESC)`
- `attendances_session_phone_unique` (UNIQUE partial: `(session_id, phone)` WHERE `phone IS NOT NULL`)

**Aturan:**
- **Duplikat check:** dalam satu sesi, tidak boleh ada dua baris dengan `phone` yang sama. Kalau `phone` kosong, cek berdasarkan `name` + `ip_hash`.
- `ip_hash` = `sha256(ip + AUTH_SECRET)`. Jangan simpan IP mentah (privacy).
- `brings_gift` spesifik untuk event travel dengan fitur tukar kado. Untuk event badminton, biarkan `false`.
- Tidak ada kolom `updated_at` — sekali absen, tidak bisa diubah (kecuali admin hapus manual).

```ts
export const attendances = pgTable('attendances', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => attendanceSessions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  organization: text('organization'),
  bringsGift: boolean('brings_gift').notNull().default(false),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }).notNull().defaultNow(),
  ipHash: text('ip_hash'),
  userAgent: text('user_agent'),
}, (t) => ({
  sessionTimeIdx: index('attendances_session_time_idx').on(t.sessionId, t.checkedInAt.desc()),
  sessionPhoneUnique: uniqueIndex('attendances_session_phone_unique')
    .on(t.sessionId, t.phone)
    .where(sql`${t.phone} IS NOT NULL`),
}));
```

---

## 4. Relasi (Drizzle Relations)

```ts
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events),
  createdSessions: many(attendanceSessions),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  rundown: many(rundownItems),
  budgets: many(budgetItems),
  media: many(eventMedia),
  extras: many(eventExtras),
  sessions: many(attendanceSessions),
}));

export const rundownItemsRelations = relations(rundownItems, ({ one }) => ({
  event: one(events, {
    fields: [rundownItems.eventId],
    references: [events.id],
  }),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  event: one(events, {
    fields: [budgetItems.eventId],
    references: [events.id],
  }),
}));

export const eventMediaRelations = relations(eventMedia, ({ one }) => ({
  event: one(events, {
    fields: [eventMedia.eventId],
    references: [events.id],
  }),
}));

export const eventExtrasRelations = relations(eventExtras, ({ one }) => ({
  event: one(events, {
    fields: [eventExtras.eventId],
    references: [events.id],
  }),
}));

export const attendanceSessionsRelations = relations(attendanceSessions, ({ one, many }) => ({
  event: one(events, {
    fields: [attendanceSessions.eventId],
    references: [events.id],
  }),
  createdBy: one(users, {
    fields: [attendanceSessions.createdBy],
    references: [users.id],
  }),
  attendances: many(attendances),
}));

export const attendancesRelations = relations(attendances, ({ one }) => ({
  session: one(attendanceSessions, {
    fields: [attendances.sessionId],
    references: [attendanceSessions.id],
  }),
}));
```

---

## 5. Query Patterns Umum

### 5.1 Ambil event lengkap dengan semua relasi

```ts
// lib/api/events.ts
export async function getEventBySlug(slug: string) {
  const result = await db.query.events.findFirst({
    where: and(eq(events.slug, slug), eq(events.isPublished, true)),
    with: {
      rundown: { orderBy: asc(rundownItems.order) },
      budgets: { orderBy: asc(budgetItems.order) },
      media: { orderBy: asc(eventMedia.order) },
      extras: true,
      sessions: {
        where: eq(attendanceSessions.isActive, true),
        limit: 1,
      },
    },
  });

  return result;
}
```

### 5.2 Ambil event mendatang untuk landing

```ts
export async function getUpcomingEvents(limit = 10) {
  return db.query.events.findMany({
    where: and(
      eq(events.isPublished, true),
      gte(events.startsAt, new Date())
    ),
    orderBy: asc(events.startsAt),
    limit,
  });
}
```

### 5.3 Cek duplikat presensi

```ts
export async function checkDuplicate(sessionId: string, phone: string | null, ipHash: string) {
  if (phone) {
    const existing = await db.query.attendances.findFirst({
      where: and(
        eq(attendances.sessionId, sessionId),
        eq(attendances.phone, phone)
      ),
    });
    return existing;
  }

  // fallback: nama + ip hash dicek di action (karena butuh name)
  return null;
}
```

### 5.4 Hitung kehadiran per sesi

```ts
export async function countAttendances(sessionId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attendances)
    .where(eq(attendances.sessionId, sessionId));

  return result[0]?.count ?? 0;
}
```

### 5.5 Buka sesi presensi (Server Action)

```ts
// actions/attendance.ts
export async function openAttendanceSession(eventId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // Tutup sesi aktif lain di event yang sama
  await db.update(attendanceSessions)
    .set({ isActive: false, closedAt: new Date() })
    .where(and(
      eq(attendanceSessions.eventId, eventId),
      eq(attendanceSessions.isActive, true)
    ));

  // Buat sesi baru
  const code = generateSessionCode();
  const [newSession] = await db.insert(attendanceSessions).values({
    eventId,
    sessionCode: code,
    isActive: true,
    openedAt: new Date(),
    createdBy: Number(session.sub),
  }).returning();

  revalidatePath(`/admin/events/${eventId}/qr`);
  return newSession;
}
```

---

## 6. Migration & Seeding

### 6.1 Generate migration

```bash
pnpm drizzle-kit generate
```

Output di `drizzle/` folder. Commit ke git.

### 6.2 Apply migration

Dev:
```bash
pnpm drizzle-kit push
```

Production:
```bash
pnpm drizzle-kit migrate
```

### 6.3 Seeding

Script `scripts/seed.ts`:

```ts
import { db } from '@/lib/db/client';
import { users, events, rundownItems, budgetItems, eventExtras } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  // Admin
  const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD!, 10);
  await db.insert(users).values({
    username: process.env.SEED_ADMIN_USERNAME!,
    passwordHash: hash,
    displayName: 'Admin NGABINTON',
    role: 'superadmin',
  }).onConflictDoNothing();

  // Event Lan Jalan Vol. 1
  const [event] = await db.insert(events).values({
    slug: 'lanjalan-vol-1',
    title: 'Lan Jalan Vol. 1',
    subtitle: 'Yuk Traveling — Walini Hot Spring, Ciwidey',
    eventType: 'travel',
    theme: 'storytelling',
    startsAt: new Date('2026-11-15T06:00:00+07:00'),
    meetingPoint: 'Vasati Rabbani',
    meetingTime: '06.00 WIB',
    returnTime: '18.00 WIB',
    location: 'Walini Hot Spring, Ciwidey',
    transportMode: 'Angkot (sewa)',
    price: 175000,
    isPublished: true,
    isFeatured: true,
  }).returning();

  // Rundown
  await db.insert(rundownItems).values([
    { eventId: event.id, order: 0, time: '06.00', title: 'Kumpul di Vasati Rabbani', note: 'Titik kumpul utama' },
    { eventId: event.id, order: 1, time: '06.00 – 08.30', title: 'Perjalanan menuju Walini Hot Spring', note: 'Plus penjemputan di beberapa titik' },
    { eventId: event.id, order: 2, time: '08.30 – 12.15', title: 'Eksplore Walini Hot Spring', note: 'Berendam dll' },
    { eventId: event.id, order: 3, time: '12.15 – 14.30', title: 'Makan siang di Pawon Kang Bima', note: 'Sekalian tukar kado (10K–15K)' },
    { eventId: event.id, order: 4, time: '14.30 – 15.30', title: 'Petik Stroberi', note: 'Optional', isOptional: true },
    { eventId: event.id, order: 5, time: '15.30 – 18.00', title: 'Perjalanan pulang', note: 'Ke rumah masing-masing yaa' },
  ]);

  // Budget
  await db.insert(budgetItems).values([
    { eventId: event.id, order: 0, label: 'Angkot', amount: 50000 },
    { eventId: event.id, order: 1, label: 'Tiket Walini Hot Spring', amount: 40000 },
    { eventId: event.id, order: 2, label: 'Sewa Gazebo', amount: 10000 },
    { eventId: event.id, order: 3, label: 'Makan Siang', amount: 50000 },
    { eventId: event.id, order: 4, label: 'Tiket Petik Stroberi', amount: 10000 },
    { eventId: event.id, order: 5, label: 'Lain-lain', amount: 15000 },
    { eventId: event.id, order: 6, label: 'TOTAL', amount: 175000, isTotal: true },
  ]);

  // Extras
  await db.insert(eventExtras).values([
    {
      eventId: event.id,
      key: 'quran_verse',
      value: {
        arabic: 'هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِنْ رِزْقِهِ ۖ وَإِلَيْهِ النُّشُورُ',
        translation: 'Dialah yang menjadikan bumi untuk kamu yang mudah dijelajahi, maka jelajahilah di segala penjurunya dan makanlah sebagian dari rezeki-Nya. Dan hanya kepada-Nyalah kamu (kembali setelah) dibangkitkan.',
        source: 'Q.S Al Mulk : 15',
      },
    },
    {
      eventId: event.id,
      key: 'gift_exchange',
      value: {
        budget_min: 10000,
        budget_max: 15000,
        rules: [
          'Wajib bawa 1 kado per orang',
          'Unisex (bebas gender)',
          'Ditukar saat makan siang di Pawon Kang Bima',
        ],
      },
    },
    {
      eventId: event.id,
      key: 'narrative',
      value: {
        title: 'Rencana yang Telah Direncanakan',
        body: 'Begitu banyak rencana yang telah kita rencanakan, ingatkan kamu… lalu ini arahnya kemana???',
      },
    },
    {
      eventId: event.id,
      key: 'pickup_points',
      value: ['Vasati Rabbani (titik utama)'],
    },
  ]);

  console.log('✅ Seed selesai');
}

seed().catch(console.error).finally(() => process.exit(0));
```

Jalankan:
```bash
pnpm tsx scripts/seed.ts
```

---

## 7. Aturan Perubahan Skema

1. **Jangan pernah hapus kolom** yang sudah ada di production tanpa migration plan. Tandai `deprecated`, lalu hapus di iterasi berikutnya.
2. **Selalu tambahkan default** untuk kolom `NOT NULL` baru di tabel yang sudah ada.
3. **Setiap perubahan skema wajib update `SCHEMA.md`** di file ini.
4. **Jangan pakai `text` untuk data yang bisa di-enum.** Pakai enum Postgres.
5. **Jangan pakai `float` / `real` untuk uang.** Pakai `integer` (rupiah) atau `numeric` (kalau butuh desimal).
6. **Timestamps selalu `timestamptz`**, bukan `timestamp` (tanpa timezone).
7. **UUID untuk entity utama** (events, sessions), **serial untuk entitas anak** (rundown, budgets, attendances). Alasan: UUID untuk URL yang di-share, serial untuk performa.

---

## 8. Referensi Cepat

| Butuh… | Lihat section |
|---|---|
| Daftar tabel | 3 |
| Enum | 2 |
| Relasi | 4 |
| Query umum | 5 |
| Seeding | 6.3 |
| Aturan perubahan | 7 |

---

**Versi:** 1.0
**Terakhir diperbarui:** [tanggal]
**Pemilik:** Tim NGABINTON
