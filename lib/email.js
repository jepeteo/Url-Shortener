import { abuseReportTemplate } from "@/lib/email/templates/abuse-report";
import { expiryReminderTemplate } from "@/lib/email/templates/expiry-reminder";
import { passwordResetTemplate } from "@/lib/email/templates/password-reset";
import { verifyEmailTemplate } from "@/lib/email/templates/verify-email";
import { OPERATOR } from "@/lib/operator";

const DEFAULT_FROM = "mikrouli.link <onboarding@resend.dev>";

async function sendEmail({ to, subject, html, text, devTag, devUrl, replyTo, headers }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${devTag}] ${to}: ${devUrl}`);
    }
    return { sent: false, dev: true };
  }

  const payload = { from, to, subject, html, text };
  if (replyTo) {
    payload.reply_to = replyTo;
  }
  if (headers) {
    payload.headers = headers;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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

export async function sendExpiryReminderEmail({ email, stage, audience, links, unsubscribeUrl }) {
  const { html, text, subject } = expiryReminderTemplate({
    stage,
    audience,
    links,
    unsubscribeUrl,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    devTag: `expiry-${stage}`,
    devUrl: unsubscribeUrl,
    headers: unsubscribeUrl
      ? {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      : undefined,
  });
}

export async function sendAbuseReportEmail({ url, reasonLabel, reporterEmail }) {
  const { html, text } = abuseReportTemplate({ url, reasonLabel, reporterEmail });

  return sendEmail({
    to: OPERATOR.abuseEmail,
    replyTo: reporterEmail || undefined,
    subject: `Abuse report: ${reasonLabel}`,
    html,
    text,
    devTag: "abuse-report",
    devUrl: url,
  });
}
