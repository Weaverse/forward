import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "mc--filters",
  title: "Collection filters",
  limit: 1,
  enabledOn: { pages: ["COLLECTION"] },
  settings: [
    {
      group: "Filters",
      inputs: [
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "Filters",
        },
        {
          type: "range",
          name: "sidebarWidth",
          label: "Sidebar width",
          defaultValue: 288,
          configs: { min: 200, max: 400, step: 8, unit: "px" },
          helpText: "Desktop only; below that the toolbar carries the facets.",
        },
        {
          type: "switch",
          name: "showCounts",
          label: "Show match counts",
          defaultValue: true,
        },
        {
          type: "switch",
          name: "sticky",
          label: "Stick while the grid scrolls",
          defaultValue: true,
        },
      ],
    },
  ],
  presets: {},
});
