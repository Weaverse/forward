import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "principle-grid",
  title: "Principle grid",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "textarea",
          name: "principles",
          label: "Principles, one `number | title | copy` row per line",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["PAGE", "CUSTOM"],
  },
  presets: {
    principles:
      "Known performance | Materials are chosen for behavior we can predict in the field, not for a number on a hangtag.\nHonest aging | Surfaces are allowed to show use without losing the job they were built to do.\nRepairable by design | Seams, hardware, and panels are specified so the repair desk can put them back into service.",
  },
});
