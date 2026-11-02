CREATE TYPE "public"."session_media_kind" AS ENUM('photo', 'video');--> statement-breakpoint
CREATE TYPE "public"."session_media_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "session_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"uploader_user_id" integer,
	"kind" "session_media_kind" NOT NULL,
	"storage_path" text NOT NULL,
	"poster_path" text,
	"caption" text,
	"duration_seconds" integer,
	"width" integer,
	"height" integer,
	"status" "session_media_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by_user_id" integer,
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_media" ADD CONSTRAINT "session_media_session_id_play_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."play_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_media" ADD CONSTRAINT "session_media_uploader_user_id_users_id_fk" FOREIGN KEY ("uploader_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_media" ADD CONSTRAINT "session_media_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_media_status_created_idx" ON "session_media" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "session_media_session_idx" ON "session_media" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_media_uploader_idx" ON "session_media" USING btree ("uploader_user_id");