export async function sendPasswordResetEmail({ email, resetUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "mikrouli.link <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[password-reset] ${email}: ${resetUrl}`);
    }
    return { sent: false, dev: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Reset your mikrouli.link password",
      html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send reset email");
  }

  return { sent: true };
}
