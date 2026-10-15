import { createSchema } from "@weaverse/next";

import { layoutInputsWith } from "@/components/section/inputs";

export const schema = createSchema({
  type: "ap--header",
  title: "Header",
  limit: 1,
  enabledOn: { pages: ["ALL_PRODUCTS"] },
  childTypes: ["heading", "paragraph"],
  settings: [
    {
      group: "Layout",
      inputs: layoutInputsWith({ width: "fixed", verticalPadding: "compact" }),
    },
  ],
  presets: {
    children: [
      { type: "heading", content: "All products", as: "h1" },
      { type: "paragraph", content: "Every product this store publishes." },
    ],
  },
});
