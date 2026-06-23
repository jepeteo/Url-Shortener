const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mikrouli.link";

export function buildSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "mikrouli.link",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: baseUrl,
    description:
      "Shorten URLs, track clicks, and manage links with analytics and QR codes.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "URL shortening",
      "Click analytics",
      "QR code generation",
      "Custom aliases",
      "API access",
    ],
  };
}

export function buildFaqPageSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function buildPricingOfferSchema(tiers) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "mikrouli.link URL Shortener",
    description: "Short links with analytics, QR codes, and API access.",
    brand: {
      "@type": "Brand",
      name: "mikrouli.link",
    },
    offers: tiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      price: String(tier.monthly),
      priceCurrency: "USD",
      description: tier.description,
      url: `${baseUrl}/pricing`,
      availability: "https://schema.org/InStock",
    })),
  };
}

export function jsonLdScript(data) {
  return {
    __html: JSON.stringify(data),
  };
}
