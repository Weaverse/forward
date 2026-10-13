import { createSchema } from "@weaverse/schema";

import { layoutInputsWith } from "@/components/section/inputs";

export const schema = createSchema({
  type: "main-collection-list",
  title: "Collection list",
  limit: 1,
  enabledOn: { pages: ["COLLECTION_LIST"] },
  childTypes: ["cl--header", "cl--grid"],
  settings: [
    {
      group: "Layout",
      inputs: layoutInputsWith({ width: "full", verticalPadding: "none" }),
    },
  ],
  presets: {
    children: [
      {
        type: "cl--header",
        children: [
          { type: "heading", content: "Categories", as: "h1" },
          {
            type: "paragraph",
            content: "Every collection this store publishes.",
          },
        ],
      },
      { type: "cl--grid", linkLabel: "Shop system →" },
    ],
  },
});
