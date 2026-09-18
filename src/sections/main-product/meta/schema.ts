import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "mp--meta",
  title: "Meta row",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [
    {
      group: "Meta row",
      inputs: [
        {
          type: "text",
          name: "label",
          label: "Label",
          defaultValue: "Forward equipment",
          helpText: "Leave empty to hide.",
        },
        {
          type: "switch",
          name: "showSpecBadge",
          label: "Show spec badge",
          defaultValue: true,
          helpText:
            "The product's first specification value, or its category when it has none.",
        },
      ],
    },
  ],
  presets: {},
});
