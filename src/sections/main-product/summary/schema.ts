import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "mp--summary",
  title: "Summary",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [
    {
      group: "Summary",
      inputs: [
        {
          type: "select",
          name: "source",
          label: "Text",
          defaultValue: "description",
          configs: {
            options: [
              { value: "description", label: "Product description" },
              { value: "subtitle", label: "Product subtitle" },
            ],
          },
        },
        {
          type: "select",
          name: "maxLines",
          label: "Max lines",
          defaultValue: "none",
          configs: {
            options: [
              { value: "none", label: "No limit" },
              { value: "3", label: "3 lines" },
              { value: "5", label: "5 lines" },
            ],
          },
        },
      ],
    },
  ],
  presets: {},
});
