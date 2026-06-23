import { describe, expect, it } from "vitest";
import {
  buildFaqPageSchema,
  buildPricingOfferSchema,
  buildSoftwareApplicationSchema,
} from "../lib/structuredData";

describe("structuredData", () => {
  it("builds SoftwareApplication schema", () => {
    const schema = buildSoftwareApplicationSchema();
    expect(schema["@type"]).toBe("SoftwareApplication");
    expect(schema.name).toBe("mikrouli.link");
  });

  it("builds FAQPage schema from faqs", () => {
    const schema = buildFaqPageSchema([
      { q: "Question?", a: "Answer." },
    ]);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(1);
    expect(schema.mainEntity[0].name).toBe("Question?");
  });

  it("builds pricing offer schema", () => {
    const schema = buildPricingOfferSchema([
      { name: "Free", monthly: 0, description: "Free tier" },
      { name: "Pro", monthly: 6, description: "Pro tier" },
    ]);
    expect(schema["@type"]).toBe("Product");
    expect(schema.offers).toHaveLength(2);
  });
});
