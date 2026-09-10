import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "collection-index",
  title: "Collection index",
  childTypes: ["section-content"],
  settings: [
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
    children: [
      {
        type: "section-content",
        children: [
          { type: "subheading", content: "Shop by system" },
          { type: "heading", content: "Built separately. Better together." },
        ],
      },
    ],
  },
});
