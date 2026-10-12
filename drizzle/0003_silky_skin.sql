CREATE TYPE "public"."rsvp_choice" AS ENUM('hadir', 'skip');--> statement-breakpoint
CREATE TABLE "session_rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" integer NOT NULL,
	"choice" "rsvp_choice" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_rsvps" ADD CONSTRAINT "session_rsvps_session_id_play_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."play_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_rsvps" ADD CONSTRAINT "session_rsvps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "session_rsvps_session_user_unique" ON "session_rsvps" USING btree ("session_id","user_id");--> statement-breakpoint
CREATE INDEX "session_rsvps_session_idx" ON "session_rsvps" USING btree ("session_id","choice");