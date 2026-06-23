CREATE TABLE "clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url_id" uuid NOT NULL,
	"short_code" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"ip" text NOT NULL,
	"user_agent" text NOT NULL,
	"referer" text
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "urls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_url" text NOT NULL,
	"short_code" text NOT NULL,
	"user_id" uuid,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp with time zone,
	"clicks" integer DEFAULT 0 NOT NULL,
	"last_clicked_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "urls_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"github_id" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"email_verified" timestamp with time zone,
	"verification_token" text,
	"verification_expires" bigint,
	"reset_password_token" text,
	"reset_password_expires" bigint,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"payment_status" text,
	"api_key_hash" text,
	"api_key_created_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_url_id_urls_id_fk" FOREIGN KEY ("url_id") REFERENCES "public"."urls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "urls" ADD CONSTRAINT "urls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clicks_url_id_timestamp_idx" ON "clicks" USING btree ("url_id","timestamp");--> statement-breakpoint
CREATE INDEX "clicks_short_code_timestamp_idx" ON "clicks" USING btree ("short_code","timestamp");--> statement-breakpoint
CREATE INDEX "urls_user_id_created_at_idx" ON "urls" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "urls_short_code_expires_at_idx" ON "urls" USING btree ("short_code","expires_at");