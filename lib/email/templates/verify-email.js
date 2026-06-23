import { emailLayout } from "./layout";

export function verifyEmailTemplate({ verifyUrl }) {
  const html = emailLayout({
    preview: "Confirm your email to unlock your full monthly link allowance on mikrouli.link.",
    heading: "Verify your email",
    bodyHtml: `
      <p style="margin:0 0 12px;">Welcome to mikrouli.link! Confirm your email address to unlock your full monthly link allowance and access all features.</p>
      <p style="margin:0;">Click the button below to verify your email. This link expires in <strong style="color:#18181b;">24 hours</strong>.</p>
    `,
    ctaLabel: "Verify email",
    ctaUrl: verifyUrl,
    footerNote:
      "If you didn't create a mikrouli.link account, you can safely ignore this email.",
  });

  const text = `Verify your mikrouli.link email

Welcome to mikrouli.link! Confirm your email address to unlock your full monthly link allowance.

Verify your email: ${verifyUrl}

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.`;

  return { html, text };
}
