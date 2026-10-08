CREATE TYPE "public"."event_theme" AS ENUM('cinema', 'storytelling');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('badminton', 'travel', 'gathering');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('poster', 'destination', 'food', 'transport', 'participant', 'gallery');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'superadmin');--> statement-breakpoint
CREATE TABLE "attendance_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"session_code" text NOT NULL,
	"label" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"opened_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"auto_close_at" timestamp with time zone,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_sessions_session_code_unique" UNIQUE("session_code")
);
--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"organization" text,
	"brings_gift" boolean DEFAULT false NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"checked_in_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"label" text NOT NULL,
	"amount" integer NOT NULL,
	"is_total" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_extras" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"alt" text,
	"caption" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"event_type" "event_type" NOT NULL,
	"theme" "event_theme" DEFAULT 'cinema' NOT NULL,
	"hero_image_url" text,
	"cover_image_url" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"meeting_point" text,
	"meeting_time" text,
	"return_time" text,
	"location" text,
	"location_url" text,
	"transport_mode" text,
	"price" integer,
	"quota" integer,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rundown_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"time" text NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"is_optional" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"role" "user_role" DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_session_id_attendance_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."attendance_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_extras" ADD CONSTRAINT "event_extras_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_media" ADD CONSTRAINT "event_media_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rundown_items" ADD CONSTRAINT "rundown_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_code_unique" ON "attendance_sessions" USING btree ("session_code");--> statement-breakpoint
CREATE INDEX "sessions_active_event_idx" ON "attendance_sessions" USING btree ("event_id","is_active");--> statement-breakpoint
CREATE INDEX "attendances_session_idx" ON "attendances" USING btree ("session_id","checked_in_at");--> statement-breakpoint
CREATE UNIQUE INDEX "attendances_session_phone_unique" ON "attendances" USING btree ("session_id","phone") WHERE "attendances"."phone" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "attendances_session_name_ip_idx" ON "attendances" USING btree ("session_id","name","ip_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "budget_event_order_unique" ON "budget_items" USING btree ("event_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "extras_event_key_unique" ON "event_extras" USING btree ("event_id","key");--> statement-breakpoint
CREATE INDEX "media_event_type_idx" ON "event_media" USING btree ("event_id","type","order");--> statement-breakpoint
CREATE INDEX "events_published_starts_idx" ON "events" USING btree ("is_published","starts_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "events_type_idx" ON "events" USING btree ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX "rundown_event_order_unique" ON "rundown_items" USING btree ("event_id","order");--> statement-breakpoint
CREATE INDEX "rundown_event_idx" ON "rundown_items" USING btree ("event_id","order");