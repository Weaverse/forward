"use client";

import { eyebrow } from "@/lib/presentation/variants";
import { parseLines } from "../parse";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface StandardStatementProps extends WeaverseElementProps {
  eyebrowLabel: string;
  statement: string;
  /** One column per line. Parsed by `./parse`. */
  columns: string;
}

/** A single wide statement expanded by a row of supporting paragraphs. */
function StandardStatement({
  eyebrowLabel,
  statement,
  columns,
  ...rest
}: StandardStatementProps) {
  return (
    <section
      {...elementAttributes(rest)}
      className="mx-auto w-full max-w-page px-page-gutter py-section-block"
    >
      <p className={eyebrow()}>{eyebrowLabel}</p>
      <h2 className="max-w-275 text-balance font-heading text-about-statement leading-display-relaxed">
        {statement}
      </h2>
      <div className="mt-17.5 grid grid-cols-3 gap-10 text-copy-lg max-md:mt-8.75 max-md:grid-cols-1 max-md:gap-2.5">
        {parseLines(columns).map((column) => (
          <p key={column}>{column}</p>
        ))}
      </div>
    </section>
  );
}

export default StandardStatement;

export { schema } from "./schema";
