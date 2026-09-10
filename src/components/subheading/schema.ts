import { createSchema } from "@weaverse/schema";

import { blockSpacingInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "subheading",
  title: "Subheading",
  settings: [
    {
      group: "Subheading",
      inputs: [
        { type: "text", name: "content", label: "Text" },
        {
          type: "select",
          name: "tone",
          label: "Tone",
          defaultValue: "strong",
          configs: {
            options: [
              { value: "strong", label: "Strong" },
              { value: "signal", label: "Signal" },
              { value: "warm", label: "Warm" },
            ],
          },
        },
      ],
    },
    { group: "Spacing", inputs: blockSpacingInputs },
  ],
  presets: {
    content: "Subheading",
    tone: "strong",
  },
});
