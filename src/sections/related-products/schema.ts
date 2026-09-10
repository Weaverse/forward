import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "related-products",
  title: "Related products",
  settings: [
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow",
        },
        {
          type: "text",
          name: "heading",
          label: "Heading",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["PRODUCT"],
  },
  presets: {
    eyebrowLabel: "Works well with",
    heading: "Complete the field system.",
  },
});
