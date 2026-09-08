"use client";

import { parseRows } from "../parse";

interface PrincipleGridProps {
  /** One `number | title | copy` row per line. Parsed by `./parse`. */
  principles: string;
}

/** Materials page: numbered principle cards on a hairline grid. */
function PrincipleGrid({ principles }: PrincipleGridProps) {
  return (
    <section className="mx-auto grid w-full max-w-page grid-cols-3 gap-px bg-ink p-px max-md:grid-cols-1">
      {parseRows(principles, 3).map(([number, title, copy]) => (
        <article
          key={number}
          className="min-h-105 bg-text-inverse p-11.25 max-md:min-h-0"
        >
          <span className="font-field-meta text-signal-strong">{number}</span>
          <h2 className="mt-20 text-balance font-heading text-material-title max-md:mt-8.75">
            {title}
          </h2>
          <p>{copy}</p>
        </article>
      ))}
    </section>
  );
}

export default PrincipleGrid;

export { schema } from "./schema";
