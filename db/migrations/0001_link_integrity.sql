ALTER TABLE "stripe_events" ADD COLUMN "processed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "urls" ADD COLUMN "creator_token_hash" text;--> statement-breakpoint
ALTER TABLE "urls" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "urls_user_id_archived_at_idx" ON "urls" USING btree ("user_id","archived_at");--> statement-breakpoint
CREATE INDEX "urls_expires_at_idx" ON "urls" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "users_stripe_customer_id_idx" ON "users" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "users_stripe_subscription_id_idx" ON "users" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "users_api_key_hash_idx" ON "users" USING btree ("api_key_hash");