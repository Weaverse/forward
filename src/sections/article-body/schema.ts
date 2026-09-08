import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "article-body",
  title: "Article body",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "backLinkLabel",
          label: "Back-link label",
        },
        {
          type: "url",
          name: "backLinkHref",
          label: "Back-link target",
        },
      ],
    },
  ],
});
