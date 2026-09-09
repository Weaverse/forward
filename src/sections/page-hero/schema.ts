import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "page-hero",
  title: "Page hero",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow fallback",
        },
        {
          type: "image",
          name: "image",
          label: "Image fallback",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["PAGE"],
  },
  presets: {
    eyebrowLabel: "Custom page",
  },
});
