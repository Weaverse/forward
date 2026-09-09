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
  enabledOn: {
    pages: ["ARTICLE"],
  },
  presets: {
    backLinkLabel: "All field notes",
    backLinkHref: "/journal",
  },
});
