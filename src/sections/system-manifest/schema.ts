import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "system-manifest",
  title: "System manifest",
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
          name: "body",
          label: "Body",
        },
        {
          type: "image",
          name: "image",
          label: "Image",
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
    eyebrowLabel: "The system",
    heading: "Prepare for change, not every possibility.",
    body: "Start with a layer that moves moisture, add warmth you can vent, and finish with a shell that packs small enough to bring every time. This kit is built to work as one system.",
    linkLabel: "Read the field note",
    linkHref: "/journal",
  },
});
