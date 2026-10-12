import { createSchema } from "@weaverse/schema";

import { layoutInputsWith } from "@/components/section/inputs";

export const schema = createSchema({
  type: "af--grid",
  title: "Articles grid",
  limit: 1,
  settings: [
    {
      group: "Layout",
      /* Item spacing would fight the grid's own gaps. */
      inputs: layoutInputsWith({
        width: "fixed",
        verticalPadding: "default",
      }).filter((input) => input.name !== "gap"),
    },
    {
      group: "Content",
      inputs: [
        { type: "text", name: "eyebrowLabel", label: "Eyebrow" },
        { type: "text", name: "heading", label: "Heading" },
        { type: "text", name: "linkLabel", label: "Link label" },
        {
          type: "switch",
          name: "skipLatest",
          label: "Skip the latest article",
          helpText: "Turn off when there is no latest-article card above.",
          defaultValue: true,
        },
      ],
    },
  ],
  presets: {},
});
