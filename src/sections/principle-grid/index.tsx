"use client";

import { Section } from "@/components/section";
import { parseRows } from "../parse";
import type { WeaverseElementProps } from "../weaverse-element";

interface PrincipleGridProps extends WeaverseElementProps {
  /** One `number | title | copy` row per line. Parsed by `./parse`. */
  principles: string;
}

/** Materials page: numbered principle cards on a hairline grid. */
function PrincipleGrid({ principles, ...rest }: PrincipleGridProps) {
  return (
    <Section
      {...rest}
      verticalPadding="none"
      containerClassName="grid grid-cols-1 gap-px bg-ink p-px md:grid-cols-3"
    >
      {parseRows(principles, 3).map(([number, title, copy]) => (
        <article
          key={number}
          className="min-h-0 bg-text-inverse p-11.25 md:min-h-105"
        >
          <span className="font-field-meta text-signal-strong">{number}</span>
          <h2 className="mt-8.75 text-balance font-heading text-material-title md:mt-20">
            {title}
          </h2>
          <p>{copy}</p>
        </article>
      ))}
    </Section>
  );
}

export default PrincipleGrid;

export { schema } from "./schema";
