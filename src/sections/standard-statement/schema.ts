import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "standard-statement",
  title: "Standard statement",
  settings: [
    { group: "Layout", inputs: layoutInputs },
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "eyebrowLabel",
          label: "Eyebrow",
        },
        {
          type: "textarea",
          name: "statement",
          label: "Statement",
        },
        {
          type: "textarea",
          name: "columns",
          label: "Columns, one per line",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["PAGE", "CUSTOM"],
  },
  presets: {
    eyebrowLabel: "The Forward standard",
    statement:
      "Useful over novel. Repairable over disposable. Quiet over loud.",
    columns:
      "We begin with the work a product must do, then remove anything that does not improve movement, protection, carry, or recovery.\nMaterials are selected for known performance and honest aging. A worn product should carry evidence of use\u2014not become obsolete.\nEvery core object belongs to a system, so layers and equipment earn their place together instead of competing for attention.",
  },
});
