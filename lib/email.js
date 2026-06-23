const DEFAULT_FROM = "mikrouli.link <onboarding@resend.dev>";

async function sendEmail({ to, subject, html, devTag, devUrl }) {
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
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send ${devTag} email`);
  }

  return { sent: true };
}

export async function sendPasswordResetEmail({ email, resetUrl }) {
  return sendEmail({
    to: email,
    subject: "Reset your mikrouli.link password",
    html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    devTag: "password-reset",
    devUrl: resetUrl,
  });
}

export async function sendVerificationEmail({ email, verifyUrl }) {
  return sendEmail({
    to: email,
    subject: "Verify your mikrouli.link email",
    html: `<p>Welcome to mikrouli.link! Confirm your email address to unlock your full monthly link allowance.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>`,
    devTag: "verify-email",
    devUrl: verifyUrl,
  });
}
