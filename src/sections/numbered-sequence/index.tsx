"use client";

import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { parseRows } from "../parse";

/** One numbered sequence step: index column, then the step description. */
const SEQUENCE_STEP_CLASS =
  "grid grid-cols-[65px_1fr] gap-5 border-border-subtle border-b py-7";

interface NumberedSequenceProps {
  eyebrowLabel: string;
  heading: string;
  /** One `number | title | copy` row per line. Parsed by `./parse`. */
  steps: string;
}

/** An ordered protocol rendered as a numbered list beside its heading. */
function NumberedSequence({
  eyebrowLabel,
  heading,
  steps,
}: NumberedSequenceProps) {
  return (
    <section className="mx-auto grid w-full max-w-page grid-cols-split-70 gap-20 px-page-gutter py-section-block max-md:grid-cols-1">
      <header>
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className={sectionHeading()}>{heading}</h2>
      </header>
      <ol className="m-0 list-none border-border-subtle border-t p-0">
        {parseRows(steps, 3).map(([number, title, copy]) => (
          <li className={SEQUENCE_STEP_CLASS} key={number}>
            <span className="font-field-meta">{number}</span>
            <div>
              <h3 className="m-0 text-balance font-heading text-feature-stat">
                {title}
              </h3>
              <p>{copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default NumberedSequence;

export { schema } from "./schema";
