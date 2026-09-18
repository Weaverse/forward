import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "mp--buy-buttons",
  title: "Buy buttons",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [
    {
      group: "Buy buttons",
      inputs: [
        {
          type: "text",
          name: "addToCartText",
          label: "Add to cart text",
          defaultValue: "Add to cart",
          helpText: "The line total is appended after a dot.",
        },
        {
          type: "text",
          name: "soldOutText",
          label: "Sold out text",
          defaultValue: "Sold out",
        },
        {
          type: "switch",
          name: "showCartNote",
          label: "Show cart note",
          defaultValue: true,
          helpText:
            "The line under the buttons saying which cart the item goes to and how checkout works.",
        },
      ],
    },
  ],
  presets: {},
});
