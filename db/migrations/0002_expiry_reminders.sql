CREATE TABLE "expiry_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"stage" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "urls" ADD COLUMN "archive_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_preferences" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "expiry_emails" ADD CONSTRAINT "expiry_emails_url_id_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."urls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expiry_emails" ADD CONSTRAINT "expiry_emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "expiry_emails_url_id_stage_idx" ON "expiry_emails" USING btree ("url_id","stage");--> statement-breakpoint
CREATE INDEX "expiry_emails_user_id_stage_idx" ON "expiry_emails" USING btree ("user_id","stage");--> statement-breakpoint
CREATE INDEX "urls_archive_reason_idx" ON "urls" USING btree ("archive_reason");