import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "product-strip",
  title: "Product strip",
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
          type: "product-list",
          name: "products",
          label: "Products",
          shouldRevalidate: true,
        },
      ],
    },
  ],
});
