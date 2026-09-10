import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "collection-grid",
  title: "Collection grid",
  childTypes: ["section-content"],
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "ctaLabel",
          label: "CTA label",
        },
        {
          type: "url",
          name: "ctaHref",
          label: "CTA link",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["COLLECTION"],
  },
  presets: {
    children: [
      {
        type: "section-content",
        children: [
          { type: "subheading", content: "Collection essentials" },
          { type: "heading", content: "A focused kit for a full day out." },
        ],
      },
    ],
    ctaLabel: "View all equipment",
    ctaHref: "/shop",
  },
});
