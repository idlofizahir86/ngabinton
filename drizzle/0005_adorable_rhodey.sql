CREATE TYPE "public"."achievement_type" AS ENUM('ace_of_month', 'pang_tangguh_of_month', 'exp_milestone', 'sessions_milestone', 'first_win');--> statement-breakpoint
CREATE TYPE "public"."finance_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."menu_key" AS ENUM('finance', 'matches', 'members', 'events');--> statement-breakpoint
CREATE TABLE "user_menu_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"menu" "menu_key" NOT NULL,
	"granted_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "achievement_type" NOT NULL,
	"code" text NOT NULL,
	"subject_key" text NOT NULL,
	"user_id" integer,
	"guest_name" text,
	"period_key" text DEFAULT 'all' NOT NULL,
	"rank" integer,
	"label" text NOT NULL,
	"description" text,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "finance_type" NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'lainnya' NOT NULL,
	"play_session_id" uuid,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_menu_access" ADD CONSTRAINT "user_menu_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_menu_access" ADD CONSTRAINT "user_menu_access_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_achievements" ADD CONSTRAINT "member_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_play_session_id_play_sessions_id_fk" FOREIGN KEY ("play_session_id") REFERENCES "public"."play_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_menu_access_user_menu_unique" ON "user_menu_access" USING btree ("user_id","menu");--> statement-breakpoint
CREATE INDEX "user_menu_access_user_idx" ON "user_menu_access" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_achievements_unique" ON "member_achievements" USING btree ("code","period_key","subject_key");--> statement-breakpoint
CREATE INDEX "member_achievements_user_idx" ON "member_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "member_achievements_guest_idx" ON "member_achievements" USING btree ("guest_name");--> statement-breakpoint
CREATE INDEX "member_achievements_period_idx" ON "member_achievements" USING btree ("period_key");--> statement-breakpoint
CREATE INDEX "finance_entries_occurred_at_idx" ON "finance_entries" USING btree ("occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "finance_entries_session_idx" ON "finance_entries" USING btree ("play_session_id");--> statement-breakpoint
CREATE INDEX "finance_entries_type_idx" ON "finance_entries" USING btree ("type");