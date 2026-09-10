import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "product-spotlight",
  title: "Product spotlight",
  settings: [
    { group: "Layout", inputs: layoutInputs },
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
