import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "page-values",
  title: "Page values",
  settings: [
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowSuffix",
          label: "Eyebrow suffix",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["PAGE"],
  },
  presets: {
    eyebrowSuffix: "Field standard",
  },
});
