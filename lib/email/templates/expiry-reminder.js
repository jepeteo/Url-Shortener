import { emailLayout } from "./layout";
import { escapeHtml, getBaseUrl } from "./utils";
import { formatExpiryDate } from "@/lib/expiry/display";

const COPY = {
  free: {
    upcoming: {
      subject: "Your mikrouli.link links expire soon",
      preview: "A few of your links stop working in the next few days.",
      heading: "Your links expire soon",
      body: "These links stop working in the next few days. Upgrade to Pro and they keep working, with a new 90-day expiry.",
      cta: "Upgrade to Pro",
    },
    today: {
      subject: "Your mikrouli.link links expire today",
      preview: "These links stop working today.",
      heading: "Your links expire today",
      body: "These links stop working today. Upgrade to Pro and they keep working, with a new 90-day expiry.",
      cta: "Upgrade to Pro",
    },
    expired: {
      subject: "Your mikrouli.link links have expired",
      preview: "These links have stopped working. Upgrade to Pro and they come back.",
      heading: "Your links have expired",
      body: "These links have stopped working. Upgrade to Pro and they come back, with a new 90-day expiry. A link you deleted is not brought back.",
      cta: "Upgrade to Pro",
    },
  },
  pro: {
    upcoming: {
      subject: "Your mikrouli.link links expire soon",
      preview: "A few of your links stop working in the next few days.",
      heading: "Your links expire soon",
      body: "These links stop working on the dates below. Upgrade to Business and they keep working, with a new one-year expiry.",
      cta: "Upgrade to Business",
    },
    today: {
      subject: "Your mikrouli.link links expire today",
      preview: "These links stop working today.",
      heading: "Your links expire today",
      body: "These links stop working today. Upgrade to Business and they keep working, with a new one-year expiry.",
      cta: "Upgrade to Business",
    },
    expired: {
      subject: "Your mikrouli.link links have expired",
      preview: "These links have stopped working. Upgrade to Business and they come back.",
      heading: "Your links have expired",
      body: "These links have stopped working. Upgrade to Business and they come back, with a new one-year expiry. A link you deleted is not brought back.",
      cta: "Upgrade to Business",
    },
  },
  "lapsed-pro": {
    upcoming: {
      subject: "Your mikrouli.link links expire soon",
      preview: "A few of your links stop working in the next few days.",
      heading: "Your links expire soon",
      body: "These links stop working in the next few days. When Pro billing is active again, they keep working, with a new 90-day expiry.",
      cta: "Review billing",
    },
    today: {
      subject: "Your mikrouli.link links expire today",
      preview: "These links stop working today.",
      heading: "Your links expire today",
      body: "These links stop working today. When Pro billing is active again, they keep working, with a new 90-day expiry.",
      cta: "Review billing",
    },
    expired: {
      subject: "Your mikrouli.link links have expired",
      preview: "These links have stopped working. They come back when Pro billing is active.",
      heading: "Your links have expired",
      body: "These links have stopped working. When Pro billing is active again, they come back, with a new 90-day expiry. A link you deleted is not brought back.",
      cta: "Review billing",
    },
  },
  "lapsed-business": {
    upcoming: {
      subject: "Your mikrouli.link links expire soon",
      preview: "A few of your links stop working in the next few days.",
      heading: "Your links expire soon",
      body: "These links stop working in the next few days. When Business billing is active again, they keep working, with a new one-year expiry.",
      cta: "Review billing",
    },
    today: {
      subject: "Your mikrouli.link links expire today",
      preview: "These links stop working today.",
      heading: "Your links expire today",
      body: "These links stop working today. When Business billing is active again, they keep working, with a new one-year expiry.",
      cta: "Review billing",
    },
    expired: {
      subject: "Your mikrouli.link links have expired",
      preview: "These links have stopped working. They come back when Business billing is active.",
      heading: "Your links have expired",
      body: "These links have stopped working. When Business billing is active again, they come back, with a new one-year expiry. A link you deleted is not brought back.",
      cta: "Review billing",
    },
  },
  business: {
    upcoming: {
      subject: "Your mikrouli.link links expire soon",
      preview: "A few of your links stop working in the next few days.",
      heading: "Your links expire soon",
      body: "These links stop working on the dates below. That is the expiry they were given.",
      cta: "Open your dashboard",
    },
    today: {
      subject: "Your mikrouli.link links expire today",
      preview: "These links stop working today.",
      heading: "Your links expire today",
      body: "These links stop working today. That is the expiry they were given.",
      cta: "Open your dashboard",
    },
    expired: {
      subject: "Your mikrouli.link links have expired",
      preview: "These links have stopped working.",
      heading: "Your links have expired",
      body: "These links have stopped working and stay archived. Create a new short link if you still need it.",
      cta: "Open your dashboard",
    },
  },
};

function safeHttpUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

function linkLines(links, baseUrl) {
  return links.map((link) => {
    const shortUrl = `${baseUrl}/${link.shortCode}`;
    const destination = safeHttpUrl(link.originalUrl);
    const when = formatExpiryDate(link.expiresAt, "en-GB", "UTC");
    return { shortUrl, destination, originalUrl: link.originalUrl, when };
  });
}

export function expiryReminderTemplate({
  stage,
  audience = "free",
  links,
  unsubscribeUrl,
  pricingUrl,
  dashboardUrl,
}) {
  const copy = (COPY[audience] || COPY.free)[stage] || COPY.free.upcoming;
  const baseUrl = getBaseUrl();
  const pricing = pricingUrl || `${baseUrl}/pricing`;
  const dashboard = dashboardUrl || `${baseUrl}/dashboard`;
  const ctaUrl = audience === "business" ? dashboard : pricing;
  const rows = linkLines(links, baseUrl);

  const listHtml = rows
    .map((row) => {
      const destination = row.destination
        ? `<a href="${escapeHtml(row.destination)}" style="color:#5B4FE9;word-break:break-all;">${escapeHtml(row.destination)}</a>`
        : escapeHtml(row.originalUrl || "");
      return `<li style="margin:0 0 12px;">
        <a href="${escapeHtml(row.shortUrl)}" style="color:#18181b;font-weight:600;word-break:break-all;">${escapeHtml(row.shortUrl)}</a><br />
        ${destination}<br />
        <span style="color:#71717a;">${escapeHtml(row.when)} UTC</span>
      </li>`;
    })
    .join("");

  const extraLinks = [];
  if (ctaUrl !== dashboard) {
    extraLinks.push(
      `<a href="${escapeHtml(dashboard)}" style="color:#5B4FE9;">Open your dashboard</a>`
    );
  }
  if (unsubscribeUrl) {
    extraLinks.push(
      `<a href="${escapeHtml(unsubscribeUrl)}" style="color:#5B4FE9;">Turn these reminders off</a>`
    );
  }

  const afterCtaHtml = `<p style="margin:8px 0 0;font-size:14px;line-height:1.5;">${extraLinks.join("<br />")}</p>`;

  const html = emailLayout({
    preview: copy.preview,
    heading: copy.heading,
    bodyHtml: `<p style="margin:0 0 16px;">${escapeHtml(copy.body)}</p><ul style="margin:0;padding-left:18px;">${listHtml}</ul>`,
    ctaLabel: copy.cta,
    ctaUrl,
    afterCtaHtml,
  });

  const textLines = [
    copy.heading,
    "",
    copy.body,
    "",
    ...rows.map((row) => `${row.shortUrl} — ${row.originalUrl} — ${row.when} UTC`),
    "",
    `${copy.cta}: ${ctaUrl}`,
  ];
  if (ctaUrl !== dashboard) {
    textLines.push(`Dashboard: ${dashboard}`);
  }
  if (unsubscribeUrl) {
    textLines.push(`Turn these reminders off: ${unsubscribeUrl}`);
  }

  return { subject: copy.subject, html, text: textLines.join("\n") };
}
