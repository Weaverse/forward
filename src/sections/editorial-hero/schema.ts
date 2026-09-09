import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "editorial-hero",
  title: "Editorial hero",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow",
        },
        {
          type: "text",
          name: "heading",
          label: "Heading",
        },
        {
          type: "textarea",
          name: "lede",
          label: "Lede",
        },
        {
          type: "image",
          name: "image",
          label: "Image",
        },
        {
          type: "select",
          name: "imageSide",
          label: "Image side",
          defaultValue: "right",
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
  enabledOn: {
    pages: ["PAGE", "CUSTOM"],
  },
  presets: {
    eyebrowLabel: "Custom page / About Forward",
    heading: "Make less equipment. Make every piece matter.",
    lede: "Forward is built around complete movement systems rather than seasonal noise: fewer products, clearer jobs, longer useful lives.",
    imageSide: "right",
  },
});
