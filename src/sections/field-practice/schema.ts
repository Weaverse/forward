import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "field-practice",
  title: "Field practice",
  childTypes: ["section-content"],
  enabledOn: { pages: ["COLLECTION"] },
  settings: [{ group: "Layout", inputs: layoutInputs }],
  presets: {
    children: [
      {
        type: "section-content",
        children: [
          { type: "subheading", content: "Field practice" },
          { type: "heading", content: "Let the route set the pace." },
        ],
      },
      {
        type: "section-content",
        children: [
          {
            type: "paragraph",
            content:
              "Efficient movement is not about speed. It is about keeping effort even, noticing what changes, and reaching the last descent with enough attention left to enjoy it.",
          },
          {
            type: "button",
            label: "More field stories",
            href: "/journal",
            intent: "link",
          },
        ],
      },
    ],
  },
});
