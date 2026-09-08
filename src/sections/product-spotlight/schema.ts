import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "product-spotlight",
  title: "Product spotlight",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowPrefix",
          label: "Eyebrow prefix",
        },
        {
          type: "text",
          name: "ctaLabel",
          label: "CTA label",
        },
        {
          type: "range",
          name: "specCount",
          label: "Spec rows shown",
          defaultValue: 3,
        },
      ],
    },
    {
      group: "Resources",
      inputs: [
        {
          type: "product",
          name: "product",
          label: "Product",
          shouldRevalidate: true,
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["INDEX", "CUSTOM"],
  },
  presets: {
    eyebrowPrefix: "Layer focus /",
    ctaLabel: "Explore the layer",
    specCount: 3,
  },
});
