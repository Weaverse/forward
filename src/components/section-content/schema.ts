import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "section-content",
  title: "Content",
  childTypes: ["subheading", "heading", "paragraph", "button", "buttons"],
  settings: [
    {
      group: "Layout",
      inputs: [
        {
          type: "select",
          name: "alignment",
          label: "Alignment",
          configs: {
            options: [
              { value: "start", label: "Left" },
              { value: "center", label: "Center" },
              { value: "end", label: "Right" },
            ],
          },
          helpText: "Overrides the alignment of every element inside.",
        },
        {
          type: "select",
          name: "justify",
          label: "Vertical position",
          configs: {
            options: [
              { value: "start", label: "Top" },
              { value: "center", label: "Middle" },
              { value: "end", label: "Bottom" },
            ],
          },
        },
      ],
    },
  ],
  presets: {
    alignment: "start",
    children: [
      { type: "subheading", content: "Subheading" },
      { type: "heading", content: "Section heading" },
      { type: "paragraph", content: "Supporting copy for this section." },
    ],
  },
});
