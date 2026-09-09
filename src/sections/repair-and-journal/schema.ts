import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "repair-and-journal",
  title: "Repair and journal",
  settings: [
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "repairEyebrowLabel",
          label: "Repair eyebrow",
        },
        {
          type: "text",
          name: "repairHeading",
          label: "Repair heading",
        },
        {
          type: "textarea",
          name: "repairBody",
          label: "Repair body",
        },
        {
          type: "text",
          name: "repairLinkLabel",
          label: "Repair link label",
        },
        {
          type: "url",
          name: "repairLinkHref",
          label: "Repair link target",
        },
        {
          type: "text",
          name: "journalEyebrowLabel",
          label: "Journal eyebrow",
        },
        {
          type: "text",
          name: "journalLinkLabel",
          label: "Journal link label",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["INDEX", "CUSTOM"],
  },
  presets: {
    repairEyebrowLabel: "Repair, not replace",
    repairHeading: "Keep equipment in motion.",
    repairBody:
      "Product defects are repaired free. Wear, accidents, and hard-earned damage are assessed honestly before work begins.",
    repairLinkLabel: "Visit the repair desk",
    repairLinkHref: "/pages/field-repair",
    journalEyebrowLabel: "Latest field note",
    journalLinkLabel: "Read the dispatch",
  },
});
