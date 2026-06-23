import { emailLayout } from "./layout";

export function passwordResetTemplate({ resetUrl }) {
  const html = emailLayout({
    preview: "Reset your mikrouli.link password — link expires in 1 hour.",
    heading: "Reset your password",
    bodyHtml: `
      <p style="margin:0 0 12px;">We received a request to reset the password for your mikrouli.link account.</p>
      <p style="margin:0;">Click the button below to choose a new password. This link expires in <strong style="color:#18181b;">1 hour</strong>.</p>
    `,
    ctaLabel: "Reset password",
    ctaUrl: resetUrl,
    footerNote:
      "If you didn't request a password reset, you can safely ignore this email. Your password will stay the same.",
  });

  const text = `Reset your mikrouli.link password

We received a request to reset the password for your account.

Reset your password: ${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, you can safely ignore this email.`;

  return { html, text };
}
