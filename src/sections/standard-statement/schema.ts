import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "standard-statement",
  title: "Standard statement",
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
          type: "textarea",
          name: "statement",
          label: "Statement",
        },
        {
          type: "textarea",
          name: "columns",
          label: "Columns, one per line",
        },
      ],
    },
  ],
});
