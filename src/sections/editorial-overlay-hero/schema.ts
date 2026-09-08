import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "editorial-overlay-hero",
  title: "Editorial overlay hero",
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
      ],
    },
  ],
});
