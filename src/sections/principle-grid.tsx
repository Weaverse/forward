import { createSchema } from "@weaverse/schema";

interface PrincipleGridProps {
  principles: readonly { number: string; title: string; copy: string }[];
}

/** Materials page: numbered principle cards on a hairline grid. */
export function PrincipleGrid({ principles }: PrincipleGridProps) {
  return (
    <section className="mx-auto grid w-full max-w-page grid-cols-3 gap-px bg-ink p-px max-md:grid-cols-1">
      {principles.map((principle) => (
        <article
          key={principle.number}
          className="min-h-105 bg-text-inverse p-11.25 max-md:min-h-0"
        >
          <span className="font-field-meta text-signal-strong">
            {principle.number}
          </span>
          <h2 className="mt-20 text-balance font-heading text-material-title max-md:mt-8.75">
            {principle.title}
          </h2>
          <p>{principle.copy}</p>
        </article>
      ))}
    </section>
  );
}

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
});
