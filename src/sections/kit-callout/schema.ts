import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "kit-callout",
  title: "Kit callout",
  settings: [
    { group: "Layout", inputs: layoutInputs },
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
          type: "text",
          name: "linkLabel",
          label: "Link label",
        },
      ],
    },
    {
      group: "Resources",
      inputs: [
        {
          type: "product",
          name: "product",
          label: "Primary product",
          shouldRevalidate: true,
        },
        {
          type: "product-list",
          name: "tileProducts",
          label: "Tile products",
          shouldRevalidate: true,
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["INDEX", "CUSTOM"],
  },
  presets: {
    eyebrowLabel: "One-day kit",
    heading: "Carry the day, not the doubt.",
    linkLabel: "View the kit",
  },
});
