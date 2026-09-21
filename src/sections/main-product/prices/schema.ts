import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "mp--prices",
  title: "Prices",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [
    {
      group: "Prices",
      inputs: [
        {
          type: "switch",
          name: "showCompareAtPrice",
          label: "Show compare-at price",
          defaultValue: true,
          helpText:
            "Only shown when the selected variant's compare-at price is genuinely higher.",
        },
        {
          type: "switch",
          name: "showSaleBadge",
          label: "Show sale badge",
          defaultValue: true,
        },
        {
          type: "text",
          name: "saleBadgeText",
          label: "Sale badge text",
          defaultValue: "On sale",
          condition: (data: { showSaleBadge?: boolean }) =>
            data.showSaleBadge !== false,
        },
      ],
    },
  ],
  presets: {},
});
