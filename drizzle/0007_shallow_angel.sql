ALTER TYPE "public"."achievement_type" ADD VALUE 'custom';--> statement-breakpoint
CREATE TABLE "achievement_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text DEFAULT 'award' NOT NULL,
	"tone" text DEFAULT 'primary' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "achievement_definitions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "finance_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_method" "finance_payment_method" NOT NULL,
	"to_method" "finance_payment_method" NOT NULL,
	"amount" integer NOT NULL,
	"description" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_achievements" ADD COLUMN "definition_id" uuid;--> statement-breakpoint
ALTER TABLE "member_achievements" ADD COLUMN "icon" text;--> statement-breakpoint
ALTER TABLE "member_achievements" ADD COLUMN "tone" text;--> statement-breakpoint
ALTER TABLE "achievement_definitions" ADD CONSTRAINT "achievement_definitions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_transfers" ADD CONSTRAINT "finance_transfers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finance_transfers_occurred_at_idx" ON "finance_transfers" USING btree ("occurred_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "member_achievements" ADD CONSTRAINT "member_achievements_definition_id_achievement_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."achievement_definitions"("id") ON DELETE set null ON UPDATE no action;