import { createSchema } from "@weaverse/schema";

import { COLLECTION_CONTENT_CHILD_TYPES } from "./content/schema";

export const schema = createSchema({
  type: "main-collection",
  title: "Main collection",
  limit: 1,
  enabledOn: { pages: ["COLLECTION"] },
  childTypes: ["mc--toolbar", "mc--content"],
  settings: [
    {
      group: "Layout",
      inputs: [
        {
          type: "select",
          name: "spacing",
          label: "Space below",
          defaultValue: "standard",
          configs: {
            options: [
              { value: "compact", label: "Compact" },
              { value: "standard", label: "Standard" },
              { value: "roomy", label: "Roomy" },
            ],
          },
        },
      ],
    },
  ],
  presets: {
    spacing: "standard",
    children: [
      { type: "mc--toolbar" },
      {
        type: "mc--content",
        children: COLLECTION_CONTENT_CHILD_TYPES.map((type) => ({ type })),
      },
    ],
  },
});
