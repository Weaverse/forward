import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";
import type { ProductSpotlightProps } from ".";

export const schema = createSchema({
  type: "product-spotlight",
  title: "Product spotlight",
  label: (data: ProductSpotlightProps) => data.loaderData?.product.title,
  settings: [
    {
      group: "Layout",
      inputs: [
        ...layoutInputs,
        {
          type: "select",
          name: "imagePosition",
          label: "Image position",
          defaultValue: "left",
          configs: {
            options: [
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ],
          },
        },
      ],
    },
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowPrefix",
          label: "Eyebrow prefix",
          helpText: "Shown before the product's category.",
        },
        {
          type: "text",
          name: "ctaLabel",
          label: "Details link label",
        },
        {
          type: "range",
          name: "specCount",
          label: "Spec rows shown",
          defaultValue: 3,
          configs: { min: 0, max: 6, step: 1 },
        },
      ],
    },
    {
      group: "Media",
      inputs: [
        {
          type: "switch",
          name: "showThumbnails",
          label: "Show thumbnails",
          defaultValue: true,
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
  presets: {
    verticalPadding: "default",
    eyebrowPrefix: "Layer focus /",
    ctaLabel: "View full details",
    specCount: 3,
    imagePosition: "left",
    showThumbnails: true,
  },
});
