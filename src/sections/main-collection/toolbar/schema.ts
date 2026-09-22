import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "mc--toolbar",
  title: "Collection toolbar",
  limit: 1,
  enabledOn: { pages: ["COLLECTION"] },
  settings: [
    {
      group: "Toolbar",
      inputs: [
        {
          type: "switch",
          name: "showCount",
          label: "Show product count",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showSort",
          label: "Show sort control",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "sticky",
          label: "Stick below the header",
          defaultValue: true,
          helpText:
            "Keeps the count and sort reachable while the grid scrolls.",
        },
      ],
    },
  ],
  presets: {},
});
