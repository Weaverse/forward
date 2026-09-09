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
  enabledOn: {
    pages: ["PAGE", "CUSTOM"],
  },
  presets: {
    eyebrowLabel: "Custom page / Field testing",
    heading: "Tested where it is used.",
    lede: "Every product is carried through real days out before it is signed off: wet, cold, loaded, and long.",
  },
});
