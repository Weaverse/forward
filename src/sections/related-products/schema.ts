import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "related-products",
  title: "Related products",
  settings: [
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
