import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "page-values",
  title: "Page values",
  settings: [
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
