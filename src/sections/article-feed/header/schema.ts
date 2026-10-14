import { createSchema } from "@weaverse/next";

import { contentWidthInput } from "@/components/section/inputs";

export const schema = createSchema({
  type: "af--header",
  title: "Header",
  limit: 1,
  settings: [
    { group: "Layout", inputs: contentWidthInput("full") },
    {
      group: "Content",
      inputs: [
        { type: "text", name: "eyebrowLabel", label: "Eyebrow" },
        {
          type: "text",
          name: "heading",
          label: "Heading",
          helpText:
            "On a blog page, leave empty to use the blog's title. Elsewhere, an empty heading hides the header.",
        },
        { type: "textarea", name: "lede", label: "Lede" },
      ],
    },
  ],
  presets: {},
});
