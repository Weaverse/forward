import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "collection-index",
  title: "Collection index",
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
    {
      group: "Resources",
      inputs: [
        {
          type: "collection-list",
          name: "collections",
          label: "Collections",
          shouldRevalidate: true,
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["INDEX", "CUSTOM"],
  },
  presets: {
    eyebrowLabel: "Shop by system",
    heading: "Built separately. Better together.",
  },
});
