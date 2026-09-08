import { createSchema } from "@weaverse/schema";

interface StatBandProps {
  stats: readonly { value: string; label: string }[];
}

/** About page: a signal-coloured band of headline counts. */
export function StatBand({ stats }: StatBandProps) {
  return (
    <section className="grid grid-cols-3 bg-signal max-md:grid-cols-1">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="grid gap-1 border-ink border-r p-13.75 max-md:border-b max-md:px-page-gutter max-md:py-8.5"
        >
          <strong className="font-heading text-display-fixed">
            {stat.value}
          </strong>
          <span className="font-field-meta text-field-meta uppercase">
            {stat.label}
          </span>
        </div>
      ))}
    </section>
  );
}

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
});
