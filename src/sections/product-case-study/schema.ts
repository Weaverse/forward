import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "product-case-study",
  title: "Product case study",
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
});
