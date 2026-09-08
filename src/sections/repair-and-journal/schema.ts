import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "repair-and-journal",
  title: "Repair and journal",
  settings: [
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
});
