import { createSchema } from "@weaverse/hydrogen/next";

export const schema = createSchema({
  type: "article-header",
  title: "Article header",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "breadcrumbLabel",
          label: "Breadcrumb label",
        },
        {
          type: "url",
          name: "breadcrumbHref",
          label: "Breadcrumb link",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["ARTICLE"],
  },
  presets: {
    breadcrumbLabel: "Journal",
    breadcrumbHref: "/journal",
  },
});
