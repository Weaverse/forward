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
});
