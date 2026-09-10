import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "home-hero",
  title: "Home hero",
  childTypes: ["section-content"],
  settings: [
    {
      group: "Content",
      inputs: [
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
    children: [
      {
        type: "section-content",
        justify: "center",
        children: [
          { type: "subheading", content: "Forward / Field equipment 2026" },
          {
            type: "heading",
            as: "h1",
            size: "hero",
            /* The hero section is labelled by this heading. */
            elementId: "home-hero-title",
            content: "Equipment for weather that changes the plan.",
          },
          {
            type: "paragraph",
            content:
              "Layerable apparel, precise footwear, and low-profile carry systems made to move together.",
          },
          {
            type: "button",
            label: "Shop all equipment",
            href: "/shop",
            intent: "signal",
          },
          {
            type: "button",
            label: "How we test",
            href: "/field-testing",
            intent: "link",
          },
        ],
      },
    ],
    stats: "3 | Systems\n9 | Core objects\nFor life | Repair",
  },
});
