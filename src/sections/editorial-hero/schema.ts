import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "editorial-hero",
  title: "Editorial hero",
  childTypes: ["section-content"],
  enabledOn: { pages: ["PAGE", "CUSTOM"] },
  settings: [
    {
      group: "Content",
      inputs: [
        { type: "image", name: "image", label: "Image" },
        {
          type: "select",
          name: "imageSide",
          label: "Image side",
          configs: {
            options: [
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ],
          },
        },
      ],
    },
  ],
  presets: {
    imageSide: "right",
    children: [
      {
        type: "section-content",
        justify: "center",
        children: [
          { type: "subheading", content: "Custom page / About Forward" },
          {
            type: "heading",
            as: "h1",
            size: "heroWide",
            content: "Make less equipment. Make every piece matter.",
          },
          {
            type: "paragraph",
            content:
              "Forward is built around complete movement systems rather than seasonal noise: fewer products, clearer jobs, longer useful lives.",
          },
        ],
      },
    ],
  },
});
