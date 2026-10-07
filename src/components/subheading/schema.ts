import { createSchema } from "@weaverse/schema";

import { blockSpacingInputs } from "@/components/section/inputs";
import type { SubheadingProps } from ".";

export const schema = createSchema({
  type: "subheading",
  title: "Subheading",
  label: (data: SubheadingProps) => data.content,
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
        {
          type: "color",
          name: "color",
          label: "Text color",
          helpText: "Overrides the tone color when set.",
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
