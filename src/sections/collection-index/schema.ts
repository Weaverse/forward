import { createSchema } from "@weaverse/next";

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
  presets: {
    children: [
      {
        type: "section-content",
        children: [
          { type: "subheading", content: "Shop by system", tone: "warm" },
          { type: "heading", content: "Built separately. Better together." },
        ],
      },
    ],
  },
});
