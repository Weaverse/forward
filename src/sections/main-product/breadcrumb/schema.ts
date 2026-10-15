import { createSchema } from "@weaverse/next";

export const schema = createSchema({
  type: "mp--breadcrumb",
  title: "Breadcrumb",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [
    {
      group: "Breadcrumb",
      inputs: [
        {
          type: "text",
          name: "shopLabel",
          label: "Shop link label",
          defaultValue: "Shop",
        },
        {
          type: "switch",
          name: "showCategory",
          label: "Show product category",
          defaultValue: true,
        },
      ],
    },
  ],
  presets: {},
});
