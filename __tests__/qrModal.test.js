import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { QRModal } from "../components/QRModal";

describe("QRModal", () => {
  it("offers PNG and SVG downloads beside the expiry warning", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://mikrouli.link";
    const html = renderToStaticMarkup(
      createElement(QRModal, {
        shortCode: "qrcode",
        expiresAt: "2026-11-01T12:00:00.000Z",
        plan: "free",
        onClose: () => {},
      })
    );

    expect(html).toContain(">PNG<");
    expect(html).toContain(">SVG<");
    expect(html).toContain('href="/pricing"');
    expect(html.match(/Printing it\?/g)).toHaveLength(2);
    expect(html).toContain("https://mikrouli.link/qrcode");
  });

  it("leaves a never-expiring link without an upgrade prompt", () => {
    const html = renderToStaticMarkup(
      createElement(QRModal, {
        shortCode: "forever",
        expiresAt: null,
        plan: "business",
        onClose: () => {},
      })
    );
    expect(html).toContain(">PNG<");
    expect(html).not.toContain("Printing it?");
    expect(html).not.toContain("/pricing");
  });
});