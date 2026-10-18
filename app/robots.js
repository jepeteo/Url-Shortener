import { buildRobots } from "@/lib/robotsPolicy";

export default function robots() {
  return buildRobots(process.env.NEXT_PUBLIC_BASE_URL || "https://mikrouli.link");
}
