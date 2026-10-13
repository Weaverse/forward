import { createSchema } from "@weaverse/schema";

import { layoutInputsWith } from "@/components/section/inputs";

export const schema = createSchema({
  type: "cl--header",
  title: "Header",
  limit: 1,
  enabledOn: { pages: ["COLLECTION_LIST"] },
  childTypes: ["heading", "paragraph"],
  settings: [
    {
      group: "Layout",
      inputs: layoutInputsWith({ width: "fixed", verticalPadding: "compact" }),
    },
  ],
  presets: {
    children: [
      { type: "heading", content: "Categories", as: "h1" },
      { type: "paragraph", content: "Every collection this store publishes." },
    ],
  },
});
