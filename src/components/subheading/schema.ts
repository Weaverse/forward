import { createSchema } from "@weaverse/schema";

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
  ],
  presets: {
    content: "Subheading",
    tone: "muted",
  },
});
