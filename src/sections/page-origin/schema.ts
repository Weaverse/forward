import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "page-origin",
  title: "Page origin",
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
          type: "textarea",
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
        {
          type: "image",
          name: "image",
          label: "Image",
        },
      ],
    },
  ],
});
