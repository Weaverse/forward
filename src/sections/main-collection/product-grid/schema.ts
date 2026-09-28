import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "mc--product-grid",
  title: "Collection product grid",
  limit: 1,
  enabledOn: { pages: ["COLLECTION"] },
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
      ],
    },
    {
      group: "Empty state",
      inputs: [
        {
          type: "text",
          name: "emptyBody",
          label: "Message",
          defaultValue: "Nothing here matches that filter.",
        },
      ],
    },
  ],
  presets: {},
});
