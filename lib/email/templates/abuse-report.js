import { BRAND, escapeHtml, getBaseUrl } from "./utils";

export function abuseReportTemplate({ url, reasonLabel, reporterEmail }) {
  const safeUrl = escapeHtml(url);
  const safeReason = escapeHtml(reasonLabel);
  const safeReporter = escapeHtml(reporterEmail || "Not provided");
  const baseUrl = escapeHtml(getBaseUrl());

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Abuse report</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.background};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="background-color:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;padding:32px;">
              <h1 style="margin:0 0 16px;font-size:22px;color:${BRAND.text};">Abuse report</h1>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:${BRAND.muted};">
                <strong style="color:${BRAND.text};">URL</strong><br />
                <a href="${safeUrl}" style="color:${BRAND.primary};word-break:break-all;">${safeUrl}</a>
              </p>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:${BRAND.muted};">
                <strong style="color:${BRAND.text};">Reason</strong><br />
                ${safeReason}
              </p>
              <p style="margin:0;font-size:15px;line-height:1.5;color:${BRAND.muted};">
                <strong style="color:${BRAND.text};">Reporter email</strong><br />
                ${safeReporter}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 8px 0;text-align:center;font-size:12px;color:${BRAND.muted};">
              <a href="${baseUrl}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.name}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Abuse report

URL: ${url}
Reason: ${reasonLabel}
Reporter email: ${reporterEmail || "Not provided"}
`;

  return { html, text };
}
