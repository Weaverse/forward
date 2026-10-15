import { createSchema } from "@weaverse/next";

import { layoutInputsWith } from "@/components/section/inputs";

/** The `af--*` children both article feeds accept, in their default order. */
export const ARTICLE_FEED_CHILD_TYPES = ["af--header", "af--lead", "af--grid"];

/** The feed's children with the copy both shells start from. */
export function articleFeedPreset(header: Record<string, string>) {
  return [
    { type: "af--header", ...header },
    { type: "af--lead", linkLabel: "Read field note" },
    {
      type: "af--grid",
      eyebrowLabel: "Latest dispatches",
      heading: "Read, learn, head out.",
      linkLabel: "Read story",
    },
  ];
}

export const schema = createSchema({
  type: "all-articles",
  title: "All articles",
  childTypes: ARTICLE_FEED_CHILD_TYPES,
  settings: [
    {
      group: "Layout",
      inputs: layoutInputsWith({ width: "full", verticalPadding: "none" }),
    },
  ],
  presets: {
    children: articleFeedPreset({
      eyebrowLabel: "The field journal",
      heading: "Notes from farther out.",
      lede: "Routes, useful skills, working knowledge, and the weather worth going out in.",
    }),
  },
});
