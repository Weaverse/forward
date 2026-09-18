import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "mp--title",
  title: "Title",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [
    {
      group: "Title",
      inputs: [
        {
          type: "select",
          name: "as",
          label: "Heading tag",
          defaultValue: "h1",
          configs: {
            options: [
              { value: "h1", label: "H1" },
              { value: "h2", label: "H2" },
            ],
          },
          helpText:
            "Keep H1 unless another element on the page already is one.",
        },
        {
          type: "toggle-group",
          name: "size",
          label: "Size",
          defaultValue: "large",
          configs: {
            options: [
              { value: "large", label: "Large" },
              { value: "medium", label: "Medium" },
            ],
          },
        },
      ],
    },
  ],
  presets: {},
});
