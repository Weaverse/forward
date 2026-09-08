import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "principle-grid",
  title: "Principle grid",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "textarea",
          name: "principles",
          label: "Principles, one `number | title | copy` row per line",
        },
      ],
    },
  ],
});
