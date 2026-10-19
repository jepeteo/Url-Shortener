import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password"),
    githubId: text("github_id"),
    plan: text("plan").notNull().default("free"),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    verificationToken: text("verification_token"),
    verificationExpires: bigint("verification_expires", { mode: "number" }),
    resetPasswordToken: text("reset_password_token"),
    resetPasswordExpires: bigint("reset_password_expires", { mode: "number" }),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    paymentStatus: text("payment_status"),
    apiKeyHash: text("api_key_hash"),
    apiKeyCreatedAt: timestamp("api_key_created_at", { withTimezone: true }),
    // true = send expiry reminder digests. One-click unsubscribe sets this false.
    emailPreferences: boolean("email_preferences").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("users_stripe_customer_id_idx").on(table.stripeCustomerId),
    index("users_stripe_subscription_id_idx").on(table.stripeSubscriptionId),
    index("users_api_key_hash_idx").on(table.apiKeyHash),
  ]
);

export const urls = pgTable(
  "urls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    originalUrl: text("original_url").notNull(),
    shortCode: text("short_code").notNull().unique(),
    userId: uuid("user_id").references(() => users.id),
    isAnonymous: boolean("is_anonymous").notNull().default(false),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    creatorTokenHash: text("creator_token_hash"),
    clicks: integer("clicks").notNull().default(0),
    lastClickedAt: timestamp("last_clicked_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    // expired | user | admin. Null on legacy rows, which are never auto-restored.
    archiveReason: text("archive_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("urls_user_id_created_at_idx").on(table.userId, table.createdAt),
    index("urls_short_code_expires_at_idx").on(table.shortCode, table.expiresAt),
    index("urls_user_id_archived_at_idx").on(table.userId, table.archivedAt),
    index("urls_expires_at_idx").on(table.expiresAt),
    index("urls_archive_reason_idx").on(table.archiveReason),
  ]
);

export const expiryEmails = pgTable(
  "expiry_emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    urlId: uuid("url_id")
      .notNull()
      .references(() => urls.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stage: text("stage").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("expiry_emails_url_id_stage_idx").on(table.urlId, table.stage),
    index("expiry_emails_user_id_stage_idx").on(table.userId, table.stage),
  ]
);

export const clicks = pgTable(
  "clicks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    urlId: uuid("url_id")
      .notNull()
      .references(() => urls.id, { onDelete: "cascade" }),
    shortCode: text("short_code").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    ip: text("ip").notNull(),
    userAgent: text("user_agent").notNull(),
    referer: text("referer"),
  },
  (table) => [
    index("clicks_url_id_timestamp_idx").on(table.urlId, table.timestamp),
    index("clicks_short_code_timestamp_idx").on(table.shortCode, table.timestamp),
  ]
);

export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});
