import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "numbered-sequence",
  title: "Numbered sequence",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow",
        },
        {
          type: "text",
          name: "heading",
          label: "Heading",
        },
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
    eyebrowLabel: "How we test",
    heading: "Four passes before a product ships.",
    steps:
      "Define the job | We write down the day the product has to survive before we draw anything.\nBuild to the job | Patterns, materials, and hardware are specified against that day, not against a trend.\nCarry it out | Prototypes go out wet, cold, loaded, and long, with the people who will use them.\nSign it off | A product ships only when the failure notes stop being about the product.",
  },
});
