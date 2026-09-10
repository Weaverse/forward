import { createSchema } from "@weaverse/schema";

import { blockSpacingInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "buttons",
  title: "Buttons",
  childTypes: ["button"],
  settings: [
    {
      group: "Layout",
      inputs: [
        {
          type: "select",
          name: "direction",
          label: "Flow",
          defaultValue: "row",
          configs: {
            options: [
              { value: "row", label: "Row" },
              { value: "col", label: "Column" },
            ],
          },
        },
      ],
    },
    { group: "Spacing", inputs: blockSpacingInputs },
  ],
  presets: {
    direction: "row",
    children: [{ type: "button", label: "Shop the catalog", href: "/shop" }],
  },
});
