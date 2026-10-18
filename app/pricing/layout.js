import { pageMetadata } from "@/lib/pageMetadata";
import { PLANS } from "@/lib/plans";
import { buildPricingOfferSchema, jsonLdScript } from "@/lib/structuredData";

export const metadata = pageMetadata({
  title: "Pricing — mikrouli.link",
  description:
    "Free, Pro, and Business plans for mikrouli.link. Start free and upgrade when you need custom aliases, charts, or API access.",
  path: "/pricing",
});

const pricingTiers = [
  {
    name: PLANS.free.name,
    monthly: PLANS.free.monthlyPrice,
    description: "Great for trying mikrouli.link",
  },
  {
    name: PLANS.pro.name,
    monthly: PLANS.pro.monthlyPrice,
    description: "For creators who need more control",
  },
  {
    name: PLANS.business.name,
    monthly: PLANS.business.monthlyPrice,
    description: "For teams and developers",
  },
];

export default function PricingLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(buildPricingOfferSchema(pricingTiers))}
      />
      {children}
    </>
  );
}
