import { createSchema } from "@weaverse/schema";

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
  enabledOn: {
    pages: ["INDEX", "CUSTOM"],
  },
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
        children: [
          {
            type: "paragraph",
            content:
              "A weather layer, breathable midlayer, close-body carry, and trail shoe form the shortest route to a complete Forward system.",
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
