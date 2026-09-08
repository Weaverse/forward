"use client";

import { parseRows } from "../parse";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface StatBandProps extends WeaverseElementProps {
  /** One `value | label` pair per line. Parsed by `./parse`. */
  stats: string;
}

/** About page: a signal-coloured band of headline counts. */
function StatBand({ stats, ...rest }: StatBandProps) {
  return (
    <section
      {...elementAttributes(rest)}
      className="grid grid-cols-3 bg-signal max-md:grid-cols-1"
    >
      {parseRows(stats, 2).map(([value, label]) => (
        <div
          key={label}
          className="grid gap-1 border-ink border-r p-13.75 max-md:border-b max-md:px-page-gutter max-md:py-8.5"
        >
          <strong className="font-heading text-display-fixed">{value}</strong>
          <span className="font-field-meta text-field-meta uppercase">
            {label}
          </span>
        </div>
      ))}
    </section>
  );
}

export default StatBand;

export { schema } from "./schema";
