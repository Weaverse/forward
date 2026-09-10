import { createSchema } from "@weaverse/schema";

import { blockSpacingInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "heading",
  title: "Heading",
  settings: [
    {
      group: "Heading",
      inputs: [
        { type: "text", name: "content", label: "Text" },
        {
          type: "text",
          name: "elementId",
          label: "Anchor id",
          helpText: "Optional. Lets a link or a label point at this heading.",
        },
        {
          type: "select",
          name: "size",
          label: "Size",
          defaultValue: "section",
          configs: {
            options: [
              { value: "hero", label: "Hero" },
              { value: "heroWide", label: "Hero (wide)" },
              { value: "page", label: "Page masthead" },
              { value: "collection", label: "Collection masthead" },
              { value: "article", label: "Article masthead" },
              { value: "statement", label: "Statement" },
              { value: "feature", label: "Feature" },
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
    { group: "Spacing", inputs: blockSpacingInputs },
  ],
  presets: {
    content: "Section heading",
    size: "section",
    as: "h2",
  },
});
