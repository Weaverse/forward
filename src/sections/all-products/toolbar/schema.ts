import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "ap--toolbar",
  title: "Toolbar",
  limit: 1,
  enabledOn: { pages: ["ALL_PRODUCTS"] },
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
        },
      ],
    },
  ],
  presets: {},
});
