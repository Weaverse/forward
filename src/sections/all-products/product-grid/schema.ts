import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "ap--product-grid",
  title: "Product grid",
  limit: 1,
  enabledOn: { pages: ["ALL_PRODUCTS"] },
  settings: [
    {
      group: "Grid",
      inputs: [
        {
          type: "toggle-group",
          name: "columns",
          label: "Columns",
          defaultValue: "3",
          configs: {
            options: [
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
            ],
          },
          helpText: "Desktop only; the grid is always two columns on mobile.",
        },
        {
          type: "text",
          name: "emptyBody",
          label: "Empty message",
          defaultValue: "This store has no published products yet.",
        },
      ],
    },
  ],
  presets: {},
});
