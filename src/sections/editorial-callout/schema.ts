import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "editorial-callout",
  title: "Editorial callout",
  childTypes: ["section-content"],
  enabledOn: { pages: ["PAGE", "CUSTOM"] },
  settings: [{ group: "Layout", inputs: layoutInputs }],
  presets: {
    children: [
      {
        type: "section-content",
        children: [
          { type: "subheading", content: "What this means" },
          { type: "heading", content: "Buy once. Repair often." },
        ],
      },
      {
        type: "section-content",
        children: [
          {
            type: "paragraph",
            content:
              "A shorter catalog means each object gets the attention it needs to last, and a repair desk that keeps it moving.",
          },
        ],
      },
      {
        type: "section-content",
        justify: "end",
        children: [
          {
            type: "button",
            label: "Explore the catalog",
            href: "/shop",
            intent: "primary",
          },
        ],
      },
    ],
  },
});
