import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "system-manifest",
  title: "System manifest",
  childTypes: ["section-content"],
  settings: [
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Content",
      inputs: [
        {
          type: "image",
          name: "image",
          label: "Image",
        },
        {
          type: "text",
          name: "linkLabel",
          label: "Link label",
        },
        {
          type: "url",
          name: "linkHref",
          label: "Link target",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["COLLECTION"],
  },
  presets: {
    children: [
      {
        type: "section-content",
        children: [
          { type: "subheading", content: "The system" },
          {
            type: "heading",
            content: "Prepare for change, not every possibility.",
          },
          {
            type: "paragraph",
            content:
              "Start with a layer that moves moisture, add warmth you can vent, and finish with a shell that packs small enough to bring every time. This kit is built to work as one system.",
          },
        ],
      },
    ],
    linkLabel: "Read the field note",
    linkHref: "/journal",
  },
});
