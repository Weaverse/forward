import { createSchema } from "@weaverse/schema";

import { contentWidthInput } from "@/components/section/inputs";

export const schema = createSchema({
  type: "cl--grid",
  title: "Collections grid",
  limit: 1,
  enabledOn: { pages: ["COLLECTION_LIST"] },
  settings: [
    { group: "Layout", inputs: contentWidthInput("full") },
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
          helpText: "Desktop only; the grid is one column on mobile.",
        },
        { type: "text", name: "linkLabel", label: "Card link label" },
      ],
    },
  ],
  presets: { linkLabel: "Shop system →" },
});
