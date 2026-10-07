import { createSchema } from "@weaverse/schema";
import type { HeroSlideProps } from ".";

export const schema = createSchema({
  type: "hero-slide",
  title: "Slide",
  label: (data: HeroSlideProps) => data.fieldTag,
  childTypes: ["section-content"],
  settings: [
    {
      group: "Image",
      inputs: [
        {
          type: "image",
          name: "image",
          label: "Image",
        },
        {
          type: "select",
          name: "imagePosition",
          label: "Image focus",
          defaultValue: "center",
          configs: {
            options: [
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
              { value: "right-low", label: "Right, lower" },
            ],
          },
          helpText:
            "Keeps the subject in frame when the image is cropped. Copy sits bottom-left, so right-hand subjects read best.",
        },
      ],
    },
    {
      group: "Details",
      inputs: [
        {
          type: "text",
          name: "fieldTag",
          label: "Field tag",
          helpText:
            "Short line over the image, e.g. coordinates and weather. Leave empty to hide.",
        },
        {
          type: "product",
          name: "featuredProduct",
          label: "Featured product",
          shouldRevalidate: true,
          helpText: "Long product names are truncated to two lines.",
        },
      ],
    },
  ],
  presets: {
    imagePosition: "center",
    children: [
      {
        type: "section-content",
        justify: "end",
        children: [
          { type: "subheading", content: "Subheading", tone: "warm" },
          { type: "heading", as: "h2", size: "hero", content: "Slide heading" },
          {
            type: "paragraph",
            width: "lede",
            marginTop: "sm",
            content: "Supporting copy for this slide.",
          },
        ],
      },
    ],
  },
});
