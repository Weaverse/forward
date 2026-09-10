import { createSchema } from "@weaverse/schema";

import { blockSpacingInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "paragraph",
  title: "Paragraph",
  settings: [
    {
      group: "Paragraph",
      inputs: [
        { type: "textarea", name: "content", label: "Text" },
        {
          type: "select",
          name: "width",
          label: "Measure",
          defaultValue: "prose",
          configs: {
            options: [
              { value: "lede", label: "Lede" },
              { value: "prose", label: "Prose" },
              { value: "full", label: "Full width" },
            ],
          },
        },
      ],
    },
    { group: "Spacing", inputs: blockSpacingInputs },
  ],
  presets: {
    content:
      "Supporting copy that explains the section in one or two sentences.",
    width: "lede",
  },
});
