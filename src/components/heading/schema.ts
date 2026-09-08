import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "heading",
  title: "Heading",
  settings: [
    {
      group: "Heading",
      inputs: [
        { type: "text", name: "content", label: "Text" },
        {
          type: "select",
          name: "size",
          label: "Size",
          defaultValue: "section",
          configs: {
            options: [
              { value: "display", label: "Display" },
              { value: "section", label: "Section" },
              { value: "subsection", label: "Subsection" },
              { value: "subsectionSpaced", label: "Subsection, spaced" },
            ],
          },
        },
        {
          type: "select",
          name: "as",
          label: "Heading level",
          defaultValue: "h2",
          configs: {
            options: [
              { value: "h1", label: "H1" },
              { value: "h2", label: "H2" },
              { value: "h3", label: "H3" },
              { value: "h4", label: "H4" },
            ],
          },
        },
      ],
    },
  ],
  presets: {
    content: "Section heading",
    size: "section",
    as: "h2",
  },
});
