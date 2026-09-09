import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "page-premise",
  title: "Page premise",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["PAGE"],
  },
  presets: {
    eyebrowLabel: "Our premise",
  },
});
