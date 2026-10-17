CREATE TYPE "public"."finance_payment_method" AS ENUM('cash', 'transfer');--> statement-breakpoint
ALTER TABLE "finance_entries" ADD COLUMN "payment_method" "finance_payment_method" DEFAULT 'cash' NOT NULL;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD COLUMN "payer_user_id" integer;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_payer_user_id_users_id_fk" FOREIGN KEY ("payer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finance_entries_payer_idx" ON "finance_entries" USING btree ("payer_user_id");