import { PLANS } from "@/lib/plans";
import { buildPricingOfferSchema, jsonLdScript } from "@/lib/structuredData";

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
