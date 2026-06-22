const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /slurp/i,
  /facebookexternalhit/i,
  /linkedinbot/i,
  /whatsapp/i,
  /googlebot/i,
  /bingpreview/i,
];

export function isBotUserAgent(userAgent) {
  if (!userAgent) {
    return false;
  }
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}
