import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "editorial-callout",
  title: "Editorial callout",
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
        {
          type: "textarea",
          name: "body",
          label: "Body",
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
    pages: ["PAGE", "CUSTOM"],
  },
  presets: {
    eyebrowLabel: "What this means",
    heading: "Buy once. Repair often.",
    body: "A shorter catalog means each object gets the attention it needs to last, and a repair desk that keeps it moving.",
    ctaLabel: "Explore the catalog",
    ctaHref: "/shop",
  },
});
