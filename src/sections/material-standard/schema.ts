import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "material-standard",
  title: "Material standard",
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
          type: "text",
          name: "primaryCtaLabel",
          label: "Primary CTA label",
        },
        {
          type: "url",
          name: "primaryCtaHref",
          label: "Primary CTA link",
        },
        {
          type: "text",
          name: "secondaryCtaLabel",
          label: "Secondary CTA label",
        },
        {
          type: "url",
          name: "secondaryCtaHref",
          label: "Secondary CTA link",
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
    pages: ["INDEX", "CUSTOM"],
  },
  presets: {
    eyebrowLabel: "Material standard",
    heading: "Fewer materials. Better understood.",
    body: "Every fabric, foam, buckle, and compound is selected around useful life, field repair, and performance you can actually feel.",
    primaryCtaLabel: "Explore materials",
    primaryCtaHref: "/materials",
    secondaryCtaLabel: "About Forward",
    secondaryCtaHref: "/about",
  },
});
