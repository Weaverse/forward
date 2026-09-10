import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

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
    { group: "Layout", inputs: layoutInputs },
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
            type: "button",
            label: "Explore materials",
            href: "/materials",
            intent: "light",
          },
          {
            type: "button",
            label: "About Forward",
            href: "/about",
            intent: "link",
          },
        ],
      },
    ],
  },
});
