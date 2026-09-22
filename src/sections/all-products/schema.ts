import { createSchema } from "@weaverse/schema";

export const ALL_PRODUCTS_CHILD_TYPES = [
  "heading",
  "paragraph",
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
      { type: "heading", content: "All products", as: "h1" },
      {
        type: "paragraph",
        content: "Every product this store publishes.",
      },
      { type: "ap--toolbar" },
      { type: "ap--product-grid" },
    ],
  },
});
