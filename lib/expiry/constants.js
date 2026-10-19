export const ARCHIVE_REASONS = {
  expired: "expired",
  user: "user",
  admin: "admin",
};

export const EXPIRY_EMAIL_STAGES = {
  upcoming: "upcoming",
  today: "today",
  expired: "expired",
};

export const EXPIRY_EMAIL_STAGE_LIST = [
  EXPIRY_EMAIL_STAGES.upcoming,
  EXPIRY_EMAIL_STAGES.today,
  EXPIRY_EMAIL_STAGES.expired,
];

/** First reminder goes out while the expiry date is this many UTC days away. */
export const REMINDER_LEAD_DAYS = 3;

export const PLAN_RANK = {
  free: 0,
  pro: 1,
  business: 2,
};
