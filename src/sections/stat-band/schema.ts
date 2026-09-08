import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "stat-band",
  title: "Stat band",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "textarea",
          name: "stats",
          label: "Stats, one `value | label` pair per line",
        },
      ],
    },
  ],
  enabledOn: {
    pages: ["PAGE", "CUSTOM"],
  },
  presets: {
    stats: "9 | core objects\n3 | movement systems\n01 | repair commitment",
  },
});
