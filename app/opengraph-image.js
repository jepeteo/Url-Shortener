import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "mikrouli.link — URL Shortener with analytics and QR codes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
            }}
          >
            🔗
          </div>
          <div style={{ fontSize: "34px", fontWeight: 700 }}>mikrouli.link</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "76px", fontWeight: 800, lineHeight: 1.05 }}>
            Short links, real insights.
          </div>
          <div style={{ fontSize: "34px", opacity: 0.92, maxWidth: "900px" }}>
            Shorten URLs, track clicks, generate QR codes, and manage every link
            from one dashboard.
          </div>
        </div>

        <div style={{ fontSize: "26px", opacity: 0.85 }}>
          Free to start · Pro & Business plans · API access
        </div>
      </div>
    ),
    { ...size }
  );
}
