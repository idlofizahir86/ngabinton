CREATE TABLE "game_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game" text NOT NULL,
	"user_id" integer NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pong_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_code" text NOT NULL,
	"host_user_id" integer,
	"host_name" text NOT NULL,
	"guest_user_id" integer,
	"guest_name" text,
	"host_score" integer NOT NULL,
	"guest_score" integer NOT NULL,
	"winner" text NOT NULL,
	"played_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pong_rooms" (
	"code" text PRIMARY KEY NOT NULL,
	"host_user_id" integer,
	"host_name" text NOT NULL,
	"guest_user_id" integer,
	"guest_name" text,
	"host_offer" text,
	"guest_answer" text,
	"status" text DEFAULT 'waiting' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_scores" ADD CONSTRAINT "game_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pong_matches" ADD CONSTRAINT "pong_matches_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pong_matches" ADD CONSTRAINT "pong_matches_guest_user_id_users_id_fk" FOREIGN KEY ("guest_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pong_rooms" ADD CONSTRAINT "pong_rooms_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pong_rooms" ADD CONSTRAINT "pong_rooms_guest_user_id_users_id_fk" FOREIGN KEY ("guest_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_scores_game_score_idx" ON "game_scores" USING btree ("game","score" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "game_scores_user_game_idx" ON "game_scores" USING btree ("user_id","game");--> statement-breakpoint
CREATE UNIQUE INDEX "pong_matches_room_unique" ON "pong_matches" USING btree ("room_code");--> statement-breakpoint
CREATE INDEX "pong_matches_host_idx" ON "pong_matches" USING btree ("host_user_id","played_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "pong_matches_guest_idx" ON "pong_matches" USING btree ("guest_user_id","played_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "pong_rooms_expires_idx" ON "pong_rooms" USING btree ("expires_at");