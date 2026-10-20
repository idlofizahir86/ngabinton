ALTER TABLE "session_attendances" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD COLUMN "payer_guest_name" text;--> statement-breakpoint
ALTER TABLE "session_attendances" ADD COLUMN "guest_name" text;--> statement-breakpoint
CREATE INDEX "finance_entries_guest_payer_idx" ON "finance_entries" USING btree ("payer_guest_name");--> statement-breakpoint
CREATE UNIQUE INDEX "session_attendances_session_guest_unique" ON "session_attendances" USING btree ("session_id","guest_name");