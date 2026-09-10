import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "material-standard",
  title: "Material standard",
  childTypes: ["section-content"],
  enabledOn: { pages: ["INDEX", "CUSTOM"] },
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
        justify: "center",
        children: [
          { type: "subheading", content: "Material standard" },
          { type: "heading", content: "Fewer materials. Better understood." },
          {
            type: "paragraph",
            content:
              "Every fabric, foam, buckle, and compound is selected around useful life, field repair, and performance you can actually feel.",
          },
          {
            type: "buttons",
            children: [
              {
                type: "button",
                label: "Explore materials",
                href: "/materials",
                intent: "signal",
                tone: "light",
              },
              {
                type: "button",
                label: "About Forward",
                href: "/about",
                intent: "link",
                tone: "light",
              },
            ],
          },
        ],
      },
    ],
  },
});
