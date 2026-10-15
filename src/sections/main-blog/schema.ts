import { createSchema } from "@weaverse/next";

import { layoutInputsWith } from "@/components/section/inputs";

import {
  ARTICLE_FEED_CHILD_TYPES,
  articleFeedPreset,
} from "../all-articles/schema";

export const schema = createSchema({
  type: "main-blog",
  title: "Blog",
  limit: 1,
  enabledOn: { pages: ["BLOG"] },
  childTypes: ARTICLE_FEED_CHILD_TYPES,
  settings: [
    {
      group: "Layout",
      inputs: layoutInputsWith({ width: "full", verticalPadding: "none" }),
    },
  ],
  /* No heading: the header falls back to the blog's title. */
  presets: {
    children: articleFeedPreset({ eyebrowLabel: "The field journal" }),
  },
});
