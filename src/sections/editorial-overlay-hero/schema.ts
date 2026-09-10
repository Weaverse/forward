import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "editorial-overlay-hero",
  title: "Editorial overlay hero",
  childTypes: ["section-content"],
  enabledOn: { pages: ["PAGE", "CUSTOM"] },
  settings: [
    {
      group: "Content",
      inputs: [{ type: "image", name: "image", label: "Image" }],
    },
  ],
  presets: {
    children: [
      {
        type: "section-content",
        justify: "end",
        children: [
          { type: "subheading", content: "Custom page / Field testing" },
          {
            type: "heading",
            as: "h1",
            size: "heroWide",
            content: "Tested where it is used.",
          },
          {
            type: "paragraph",
            content:
              "Every product is carried through real days out before it is signed off: wet, cold, loaded, and long.",
          },
        ],
      },
    ],
  },
});
