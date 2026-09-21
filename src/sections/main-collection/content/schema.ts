import { createSchema } from "@weaverse/schema";

/** The results row's elements, in their default order. */
export const COLLECTION_CONTENT_CHILD_TYPES = [
  "mc--filters",
  "mc--product-grid",
];

export const schema = createSchema({
  type: "mc--content",
  title: "Collection content",
  limit: 1,
  enabledOn: { pages: ["COLLECTION"] },
  childTypes: COLLECTION_CONTENT_CHILD_TYPES,
  settings: [
    {
      group: "Layout",
      inputs: [
        {
          type: "toggle-group",
          name: "gap",
          label: "Column gap",
          defaultValue: "md",
          configs: {
            options: [
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ],
          },
        },
      ],
    },
  ],
  presets: {
    children: COLLECTION_CONTENT_CHILD_TYPES.map((type) => ({ type })),
  },
});
