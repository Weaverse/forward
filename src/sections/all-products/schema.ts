import { createSchema } from "@weaverse/next";

import { layoutInputsWith } from "@/components/section/inputs";

export const ALL_PRODUCTS_CHILD_TYPES = [
  "ap--header",
  "ap--toolbar",
  "ap--product-grid",
];

export const schema = createSchema({
  type: "all-products",
  title: "All products",
  limit: 1,
  enabledOn: { pages: ["ALL_PRODUCTS"] },
  childTypes: ALL_PRODUCTS_CHILD_TYPES,
  settings: [
    {
      group: "Layout",
      inputs: [
        ...layoutInputsWith({ width: "full", verticalPadding: "none" }),
        {
          type: "select",
          name: "spacing",
          label: "Space below",
          defaultValue: "standard",
          configs: {
            options: [
              { value: "compact", label: "Compact" },
              { value: "standard", label: "Standard" },
              { value: "roomy", label: "Roomy" },
            ],
          },
        },
      ],
    },
  ],
  presets: {
    spacing: "standard",
    children: [
      {
        type: "ap--header",
        children: [
          { type: "heading", content: "All products", as: "h1" },
          { type: "paragraph", content: "Every product this store publishes." },
        ],
      },
      { type: "ap--toolbar" },
      { type: "ap--product-grid" },
    ],
  },
});
