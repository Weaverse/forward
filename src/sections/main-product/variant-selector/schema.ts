import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "mp--variant-selector",
  title: "Variant selector",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [
    {
      group: "Variant selector",
      inputs: [
        {
          type: "text",
          name: "colorLabel",
          label: "Colorway label",
          defaultValue: "Color",
        },
        {
          type: "switch",
          name: "showSwatches",
          label: "Show color swatches",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "showSelectedValue",
          label: "Show selected value",
          defaultValue: true,
          helpText: "Names the current choice beside each option label.",
        },
      ],
    },
  ],
  presets: {},
});
