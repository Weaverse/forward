import { createSchema } from "@weaverse/schema";
import type { ProductCaseStudyProps } from ".";

export const schema = createSchema({
  type: "product-case-study",
  title: "Product case study",
  label: (data: ProductCaseStudyProps) => data.loaderData?.product.title,
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow",
        },
        {
          type: "text",
          name: "ctaLabel",
          label: "CTA label",
        },
        {
          type: "product",
          name: "product",
          label: "Product",
          shouldRevalidate: true,
        },
        {
          type: "image",
          name: "image",
          label: "Image",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["PAGE", "CUSTOM"],
  },
  presets: {
    eyebrowLabel: "Case study",
    ctaLabel: "View the product",
  },
});
