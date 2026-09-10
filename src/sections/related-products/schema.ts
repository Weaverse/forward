import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "related-products",
  title: "Related products",
  childTypes: ["section-content"],
  settings: [{ group: "Layout", inputs: layoutInputs }],
  enabledOn: {
    pages: ["PRODUCT"],
  },
  presets: {
    children: [
      {
        type: "section-content",
        children: [
          { type: "subheading", content: "Works well with" },
          { type: "heading", content: "Complete the field system." },
        ],
      },
    ],
  },
});
