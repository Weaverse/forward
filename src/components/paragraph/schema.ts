import { createSchema } from "@weaverse/schema";

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
  ],
});
