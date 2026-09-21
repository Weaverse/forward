import { createSchema } from "@weaverse/schema";

/** The info column's elements, in their default order. */
export const PRODUCT_INFO_CHILD_TYPES = [
  "mp--breadcrumb",
  "mp--meta",
  "mp--title",
  "mp--prices",
  "mp--summary",
  "mp--variant-selector",
  "mp--buy-buttons",
  "mp--collapsible-details",
];

export const schema = createSchema({
  type: "mp--info",
  title: "Product info",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  childTypes: PRODUCT_INFO_CHILD_TYPES,
  settings: [
    {
      group: "Panel",
      inputs: [
        {
          type: "switch",
          name: "sticky",
          label: "Stick while the gallery scrolls",
          defaultValue: true,
          helpText: "Tablet and desktop only.",
        },
      ],
    },
  ],
  presets: {
    children: PRODUCT_INFO_CHILD_TYPES.map((type) => ({ type })),
  },
});
