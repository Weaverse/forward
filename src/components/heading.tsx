import { createSchema } from "@weaverse/schema";

import { cn } from "@/lib/cn";
import { sectionHeading } from "@/lib/presentation/variants";

type HeadingSize = "display" | "section" | "subsection" | "subsectionSpaced";
type HeadingTag = "h1" | "h2" | "h3" | "h4";

export interface HeadingProps {
  content: string;
  size?: HeadingSize;
  as?: HeadingTag;
  className?: string;
}

/**
 * Shared heading element.
 *
 * Presentation comes from the existing `sectionHeading` recipe, so a heading
 * authored in Studio and one authored in a route render identically. `as`
 * stays separate from `size` because heading level is document structure, not
 * appearance: a visually small heading may still be the page's `h1`.
 */
function Heading({
  as: Tag = "h2",
  className,
  content,
  size = "section",
}: HeadingProps) {
  return (
    <Tag className={cn(sectionHeading({ size }), className)}>{content}</Tag>
  );
}

export default Heading;

export const schema = createSchema({
  type: "heading",
  title: "Heading",
  settings: [
    {
      group: "Heading",
      inputs: [
        { type: "text", name: "content", label: "Text" },
        {
          type: "select",
          name: "size",
          label: "Size",
          defaultValue: "section",
          configs: {
            options: [
              { value: "display", label: "Display" },
              { value: "section", label: "Section" },
              { value: "subsection", label: "Subsection" },
              { value: "subsectionSpaced", label: "Subsection, spaced" },
            ],
          },
        },
        {
          type: "select",
          name: "as",
          label: "Heading level",
          defaultValue: "h2",
          configs: {
            options: [
              { value: "h1", label: "H1" },
              { value: "h2", label: "H2" },
              { value: "h3", label: "H3" },
              { value: "h4", label: "H4" },
            ],
          },
        },
      ],
    },
  ],
});
