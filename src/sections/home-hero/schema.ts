import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "home-hero",
  title: "Home hero",
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
          name: "lede",
          label: "Lede",
        },
        {
          type: "text",
          name: "primaryCtaLabel",
          label: "Primary CTA label",
        },
        {
          type: "url",
          name: "primaryCtaHref",
          label: "Primary CTA link",
        },
        {
          type: "text",
          name: "secondaryCtaLabel",
          label: "Secondary CTA label",
        },
        {
          type: "url",
          name: "secondaryCtaHref",
          label: "Secondary CTA link",
        },
        {
          type: "textarea",
          name: "stats",
          label: "Stats (one `value | label` row per line)",
        },
        {
          type: "image",
          name: "image",
          label: "Image",
        },
      ],
    },
    {
      group: "Resources",
      inputs: [
        {
          type: "product",
          name: "featuredProduct",
          label: "Featured product",
          shouldRevalidate: true,
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["INDEX"],
  },
  presets: {
    eyebrowLabel: "Forward / Field equipment 2026",
    heading: "Equipment for weather that changes the plan.",
    lede: "Layerable apparel, precise footwear, and low-profile carry systems made to move together.",
    primaryCtaLabel: "Shop all equipment",
    primaryCtaHref: "/shop",
    secondaryCtaLabel: "How we test",
    secondaryCtaHref: "/field-testing",
    stats: "3 | Systems\n9 | Core objects\nFor life | Repair",
  },
});
