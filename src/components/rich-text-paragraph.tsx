import Link from "next/link";

import type { RichTextParagraph as RichTextParagraphModel } from "@/lib/storefront/types";

/** Stable React key for one normalized rich-text paragraph. */
export function richTextParagraphKey(
  paragraph: RichTextParagraphModel,
): string {
  return paragraph.map((run) => `${run.href ?? "text"}:${run.text}`).join("|");
}

/** Renders one normalized paragraph, routing internal links through Next. */
export function RichTextParagraph({
  paragraph,
}: {
  paragraph: RichTextParagraphModel;
}) {
  return (
    <>
      {paragraph.map((run) => {
        const key = `${run.href ?? "text"}:${run.text}`;
        return run.href?.startsWith("/") ? (
          <Link href={run.href} key={key}>
            {run.text}
          </Link>
        ) : run.href ? (
          <a href={run.href} key={key}>
            {run.text}
          </a>
        ) : (
          run.text
        );
      })}
    </>
  );
}
