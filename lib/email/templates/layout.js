import { BRAND, escapeHtml, getBaseUrl } from "./utils";

export function emailLayout({
  preview,
  heading,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  footerNote,
}) {
  const safePreview = escapeHtml(preview);
  const safeHeading = escapeHtml(heading);
  const safeCtaLabel = escapeHtml(ctaLabel);
  const safeCtaUrl = escapeHtml(ctaUrl);
  const safeFooterNote = footerNote ? escapeHtml(footerNote) : "";
  const baseUrl = escapeHtml(getBaseUrl());

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${safeHeading}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 28px 20px !important; }
      .button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${safePreview}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.background};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="padding-bottom:24px;" align="center">
              <a href="${baseUrl}" style="text-decoration:none;display:inline-block;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,${BRAND.primaryDark} 0%,${BRAND.violet} 50%,${BRAND.fuchsia} 100%);text-align:center;vertical-align:middle;font-size:20px;line-height:40px;">
                      &#128279;
                    </td>
                    <td style="padding-left:12px;font-size:20px;font-weight:700;color:${BRAND.text};letter-spacing:-0.02em;">
                      ${BRAND.name}
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
          <tr>
            <td class="content" style="background-color:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;padding:40px 36px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:700;color:${BRAND.text};letter-spacing:-0.02em;">
                ${safeHeading}
              </h1>
              <div style="font-size:16px;line-height:1.6;color:${BRAND.muted};">
                ${bodyHtml}
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0 8px;">
                <tr>
                  <td>
                    <a href="${safeCtaUrl}" class="button" style="display:inline-block;padding:14px 28px;border-radius:10px;background:linear-gradient(135deg,${BRAND.primaryDark} 0%,${BRAND.violet} 50%,${BRAND.fuchsia} 100%);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;text-align:center;box-shadow:0 4px 14px rgba(91,79,233,0.35);">
                      ${safeCtaLabel}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${BRAND.muted};word-break:break-all;">
                Or copy this link:<br />
                <a href="${safeCtaUrl}" style="color:${BRAND.primary};text-decoration:underline;">${safeCtaUrl}</a>
              </p>
              ${
                safeFooterNote
                  ? `<p style="margin:24px 0 0;padding-top:24px;border-top:1px solid ${BRAND.border};font-size:13px;line-height:1.5;color:${BRAND.muted};">${safeFooterNote}</p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0;text-align:center;font-size:12px;line-height:1.5;color:${BRAND.muted};">
              <p style="margin:0 0 8px;">${BRAND.tagline}</p>
              <p style="margin:0;">
                <a href="${baseUrl}" style="color:${BRAND.primary};text-decoration:none;">${BRAND.name}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
