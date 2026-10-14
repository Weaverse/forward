import { createSchema } from "@weaverse/next";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "featured-products",
  title: "Featured products",
  childTypes: ["section-content"],
  settings: [
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Resources",
      inputs: [
        {
          type: "product-list",
          name: "products",
          label: "Products",
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
          { type: "subheading", content: "New field rotation" },
          {
            type: "heading",
            elementId: "home-featured-title",
            content: "Start with the core four.",
          },
        ],
      },
      {
        type: "section-content",
        justify: "end",
        children: [
          {
            type: "button",
            label: "Shop the full catalog",
            href: "/shop",
            intent: "link",
          },
        ],
      },
    ],
  },
});
