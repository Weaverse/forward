"use client";

import { cva, type VariantProps } from "class-variance-authority";

import { Section, type SectionProps } from "@/components/section";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import { CollectionCard } from "../../collection-card";
import type { WeaverseElementProps } from "../../weaverse-element";

const grid = cva("grid grid-cols-1", {
  variants: {
    columns: {
      "2": "md:grid-cols-2",
      "3": "md:grid-cols-3",
      "4": "md:grid-cols-2 lg:grid-cols-4",
    },
  },
  defaultVariants: { columns: "3" },
});

interface CollectionListGridProps extends WeaverseElementProps {
  columns?: VariantProps<typeof grid>["columns"];
  linkLabel?: string;
  width?: SectionProps["width"];
}

/** Every collection as a card linking to its `/shop/<handle>` page. */
function CollectionListGrid({
  columns,
  linkLabel = "",
  width = "full",
  ...rest
}: CollectionListGridProps) {
  const collections = useStorefrontContext().collections ?? [];
  if (collections.length === 0) return null;

  return (
    <Section
      {...rest}
      containerClassName={grid({ columns })}
      verticalPadding="none"
      width={width}
    >
      {collections.map((collection) => (
        <CollectionCard
          collection={collection}
          key={collection.handle}
          linkLabel={linkLabel}
        />
      ))}
    </Section>
  );
}

export default CollectionListGrid;

export { schema } from "./schema";
