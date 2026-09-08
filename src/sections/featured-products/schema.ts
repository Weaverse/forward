import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "featured-products",
  title: "Featured products",
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
    {
      group: "Resources",
      inputs: [
        {
          type: "product-list",
          name: "products",
          label: "Products",
          shouldRevalidate: true,
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["INDEX", "CUSTOM"],
  },
  presets: {
    eyebrowLabel: "New field rotation",
    heading: "Start with the core four.",
    body: "A weather layer, breathable midlayer, close-body carry, and trail shoe form the shortest route to a complete Forward system.",
    linkLabel: "Shop all equipment",
    linkHref: "/shop",
  },
});
