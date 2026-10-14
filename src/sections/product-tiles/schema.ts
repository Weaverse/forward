import { createSchema } from "@weaverse/next";

export const schema = createSchema({
  type: "product-tiles",
  title: "Product tiles",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "product-list",
          name: "products",
          label: "Products",
          shouldRevalidate: true,
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["PAGE", "CUSTOM"],
  },
  presets: {},
});
