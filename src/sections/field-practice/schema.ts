import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "field-practice",
  title: "Field practice",
  settings: [
    { group: "Layout", inputs: layoutInputs },
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
          name: "body",
          label: "Body",
        },
        {
          type: "text",
          name: "linkLabel",
          label: "Link label",
        },
        {
          type: "url",
          name: "linkHref",
          label: "Link target",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["COLLECTION"],
  },
  presets: {
    eyebrowLabel: "Field practice",
    heading: "Let the route set the pace.",
    body: "Efficient movement is not about speed. It is about keeping effort even, noticing what changes, and reaching the last descent with enough attention left to enjoy it.",
    linkLabel: "More field stories",
    linkHref: "/journal",
  },
});
