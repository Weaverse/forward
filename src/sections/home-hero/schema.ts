import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "home-hero",
  title: "Home hero",
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
    {
      group: "Resources",
      inputs: [
        {
          type: "product",
          name: "featuredProduct",
          label: "Featured product",
          shouldRevalidate: true,
        },
      ],
    },
  ],
});
