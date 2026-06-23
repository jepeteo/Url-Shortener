import { passwordResetTemplate } from "@/lib/email/templates/password-reset";
import { verifyEmailTemplate } from "@/lib/email/templates/verify-email";

const DEFAULT_FROM = "mikrouli.link <onboarding@resend.dev>";

async function sendEmail({ to, subject, html, text, devTag, devUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${devTag}] ${to}: ${devUrl}`);
    }
    return { sent: false, dev: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send ${devTag} email`);
  }

  return { sent: true };
}

export async function sendPasswordResetEmail({ email, resetUrl }) {
  const { html, text } = passwordResetTemplate({ resetUrl });

  return sendEmail({
    to: email,
    subject: "Reset your mikrouli.link password",
    html,
    text,
    devTag: "password-reset",
    devUrl: resetUrl,
  });
}

export async function sendVerificationEmail({ email, verifyUrl }) {
  const { html, text } = verifyEmailTemplate({ verifyUrl });

  return sendEmail({
    to: email,
    subject: "Verify your mikrouli.link email",
    html,
    text,
    devTag: "verify-email",
    devUrl: verifyUrl,
  });
}
