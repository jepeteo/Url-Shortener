export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const BRAND = {
  name: "mikrouli.link",
  tagline: "Short links, real insights.",
  primary: "#5B4FE9",
  primaryDark: "#4f46e5",
  violet: "#7c3aed",
  fuchsia: "#c026d3",
  text: "#18181b",
  muted: "#71717a",
  border: "#e4e4e7",
  background: "#f4f4f5",
  card: "#ffffff",
};

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://mikrouli.link";
}
