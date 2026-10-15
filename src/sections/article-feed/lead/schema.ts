import { createSchema } from "@weaverse/next";

import { contentWidthInput } from "@/components/section/inputs";

export const schema = createSchema({
  type: "af--lead",
  title: "Latest article",
  limit: 1,
  settings: [
    { group: "Layout", inputs: contentWidthInput("full") },
    {
      group: "Content",
      inputs: [{ type: "text", name: "linkLabel", label: "Link label" }],
    },
  ],
  presets: {},
});
