import { createSchema } from "@weaverse/schema";

type Data = Record<string, unknown>;

export const schema = createSchema({
  type: "mp--collapsible-details",
  title: "Collapsible details",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [
    {
      group: "Behaviour",
      inputs: [
        {
          type: "switch",
          name: "openFirst",
          label: "Open the first panel",
          defaultValue: true,
        },
      ],
    },
    {
      group: "Why it works",
      inputs: [
        {
          type: "switch",
          name: "showDetails",
          label: "Show",
          defaultValue: true,
        },
        {
          type: "text",
          name: "detailsTitle",
          label: "Title",
          defaultValue: "Why it works",
          condition: (data: Data) => data.showDetails !== false,
        },
      ],
    },
    {
      group: "Specifications",
      inputs: [
        {
          type: "switch",
          name: "showSpecs",
          label: "Show",
          defaultValue: true,
        },
        {
          type: "text",
          name: "specsTitle",
          label: "Title",
          defaultValue: "Specifications",
          condition: (data: Data) => data.showSpecs !== false,
        },
      ],
    },
    {
      group: "Materials + care",
      inputs: [
        {
          type: "switch",
          name: "showCare",
          label: "Show",
          defaultValue: true,
        },
        {
          type: "text",
          name: "careTitle",
          label: "Title",
          defaultValue: "Materials + care",
          condition: (data: Data) => data.showCare !== false,
        },
      ],
    },
    {
      group: "Repair",
      inputs: [
        {
          type: "switch",
          name: "showRepair",
          label: "Show",
          defaultValue: true,
        },
        {
          type: "text",
          name: "repairTitle",
          label: "Title",
          defaultValue: "Repair",
          condition: (data: Data) => data.showRepair !== false,
        },
        {
          type: "text",
          name: "repairLinkText",
          label: "Link text",
          defaultValue: "The repairs programme",
          helpText: "Leave empty to hide the link.",
          condition: (data: Data) => data.showRepair !== false,
        },
        {
          type: "url",
          name: "repairLinkHref",
          label: "Link",
          defaultValue: "/pages/field-repair",
          condition: (data: Data) => data.showRepair !== false,
        },
      ],
    },
  ],
  presets: {},
});
