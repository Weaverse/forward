import { createSchema } from "@weaverse/next";

export const schema = createSchema({
  type: "hero-slideshow",
  title: "Hero slideshow",
  childTypes: ["hero-slide"],
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "textarea",
          name: "stats",
          label: "Stats (one `value | label` row per line)",
        },
      ],
    },
  ],
  presets: {
    stats: "3 | Systems\n9 | Core objects\nFor life | Repair",
    children: [
      {
        type: "hero-slide",
        image: {
          url: "/images/editorial/hero-ridge-lookout.webp",
          altText:
            "Hiker with a pack on a rocky ledge above a mountain valley under a clear blue sky",
          width: 3200,
          height: 2400,
        },
        imagePosition: "right-low",
        fieldTag: "N 49°13′ / 19°58′ E · 11 °C · Clear",
        children: [
          {
            type: "section-content",
            justify: "end",
            children: [
              {
                type: "subheading",
                content: "Forward / Field equipment 2026",
                tone: "warm",
              },
              {
                type: "heading",
                as: "h1",
                size: "hero",
                content: "Equipment for weather that changes the plan.",
              },
              {
                type: "paragraph",
                width: "lede",
                marginTop: "sm",
                content:
                  "Layerable apparel, precise footwear, and low-profile carry systems made to move together.",
              },
              {
                type: "buttons",
                marginTop: "md",
                children: [
                  {
                    type: "button",
                    label: "Shop all equipment",
                    href: "/shop",
                    intent: "signal",
                    tone: "light",
                  },
                  {
                    type: "button",
                    label: "How we test",
                    href: "/field-testing",
                    intent: "link",
                    tone: "light",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "hero-slide",
        image: {
          url: "/images/editorial/hero-pack-climb.webp",
          altText:
            "Two hikers with orange and yellow packs climbing a sunny alpine slope",
          width: 3200,
          height: 2133,
        },
        imagePosition: "right-low",
        fieldTag: "N 39°44′ / 106°17′ W · 9 °C · Wind 14 km/h",
        children: [
          {
            type: "section-content",
            justify: "end",
            children: [
              {
                type: "subheading",
                content: "Forward / Carry systems",
                tone: "warm",
              },
              {
                /* Only the first slide carries the page's h1. */
                type: "heading",
                as: "h2",
                size: "hero",
                content: "Packs that disappear until you need them.",
              },
              {
                type: "paragraph",
                width: "lede",
                marginTop: "sm",
                content:
                  "Low-profile carry that stays stable on scree, quiet in the wind, and easy to reach on the move.",
              },
              {
                type: "buttons",
                marginTop: "md",
                children: [
                  {
                    type: "button",
                    label: "Shop packs",
                    href: "/shop",
                    intent: "signal",
                    tone: "light",
                  },
                  {
                    type: "button",
                    label: "How we test",
                    href: "/field-testing",
                    intent: "link",
                    tone: "light",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
