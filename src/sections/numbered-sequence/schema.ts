import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "numbered-sequence",
  title: "Numbered sequence",
  childTypes: ["section-content"],
  settings: [
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Content",
      inputs: [
        {
          type: "textarea",
          name: "steps",
          label: "Steps, one `number | title | copy` row per line",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["PAGE", "CUSTOM"],
  },
  presets: {
    children: [
      {
        type: "section-content",
        children: [
          { type: "subheading", content: "How we test" },
          { type: "heading", content: "Four passes before a product ships." },
        ],
      },
    ],
    steps:
      "Define the job | We write down the day the product has to survive before we draw anything.\nBuild to the job | Patterns, materials, and hardware are specified against that day, not against a trend.\nCarry it out | Prototypes go out wet, cold, loaded, and long, with the people who will use them.\nSign it off | A product ships only when the failure notes stop being about the product.",
  },
});
