import { createSchema } from "@weaverse/schema";

import { PRODUCT_INFO_CHILD_TYPES } from "./info/schema";

export const schema = createSchema({
  type: "main-product",
  title: "Main product",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  childTypes: ["mp--media", "mp--info"],
  settings: [
    {
      group: "Layout",
      inputs: [
        {
          type: "toggle-group",
          name: "galleryPosition",
          label: "Gallery position",
          defaultValue: "right",
          configs: {
            options: [
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ],
          },
          helpText: "Tablet and desktop. On mobile the gallery always leads.",
        },
        {
          type: "select",
          name: "panelWidth",
          label: "Info panel width",
          defaultValue: "standard",
          configs: {
            options: [
              { value: "standard", label: "Standard" },
              { value: "wide", label: "Wide" },
            ],
          },
          helpText:
            "Standard narrows the panel on large screens to give the gallery more room.",
        },
      ],
    },
  ],
  presets: {
    galleryPosition: "right",
    panelWidth: "standard",
    children: [
      { type: "mp--media" },
      {
        type: "mp--info",
        children: PRODUCT_INFO_CHILD_TYPES.map((type) => ({ type })),
      },
    ],
  },
});
