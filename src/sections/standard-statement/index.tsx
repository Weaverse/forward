"use client";

import type { ReactNode } from "react";

import { Section } from "@/components/section";
import { parseLines } from "../parse";
import type { WeaverseElementProps } from "../weaverse-element";

interface StandardStatementProps extends WeaverseElementProps {
  children?: ReactNode;
  /** One column per line. Parsed by `./parse`. */
  columns: string;
}

/** A single wide statement expanded by a row of supporting paragraphs. */
function StandardStatement({
  children,
  columns,
  ...rest
}: StandardStatementProps) {
  return (
    <Section {...rest}>
      {children}
      <div className="mt-8.75 grid grid-cols-1 gap-2.5 text-copy-lg md:mt-17.5 md:grid-cols-3 md:gap-10">
        {parseLines(columns).map((column) => (
          <p key={column}>{column}</p>
        ))}
      </div>
    </Section>
  );
}

export default StandardStatement;

export { schema } from "./schema";
