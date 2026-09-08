import { createSchema } from "@weaverse/schema";
import { eyebrow } from "@/lib/presentation/variants";

interface StandardStatementProps {
  eyebrowLabel: string;
  statement: string;
  columns: readonly string[];
}

/** A single wide statement expanded by a row of supporting paragraphs. */
export function StandardStatement({
  eyebrowLabel,
  statement,
  columns,
}: StandardStatementProps) {
  return (
    <section className="mx-auto w-full max-w-page px-page-gutter py-section-block">
      <p className={eyebrow()}>{eyebrowLabel}</p>
      <h2 className="max-w-275 text-balance font-heading text-about-statement leading-display-relaxed">
        {statement}
      </h2>
      <div className="mt-17.5 grid grid-cols-3 gap-10 text-copy-lg max-md:mt-8.75 max-md:grid-cols-1 max-md:gap-2.5">
        {columns.map((column) => (
          <p key={column}>{column}</p>
        ))}
      </div>
    </section>
  );
}

export const schema = createSchema({
  type: "standard-statement",
  title: "Standard statement",
  settings: [
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
});
