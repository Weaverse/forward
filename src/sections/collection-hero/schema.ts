import { createSchema } from "@weaverse/next";

export const schema = createSchema({
  type: "collection-hero",
  title: "Collection hero",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowPrefix",
          label: "Eyebrow prefix",
        },
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
    eyebrowPrefix: "Movement system /",
    ctaLabel: "Shop the complete index",
    ctaHref: "/shop",
  },
});
