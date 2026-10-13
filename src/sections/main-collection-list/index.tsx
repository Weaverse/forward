"use client";

import { Section, type SectionProps } from "@/components/section";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

/**
 * The collection list (`/categories`). The route reads every collection and
 * hands them down through the data context; this shell owns layout only. It
 * runs full width by default so the grid's cards can meet the page edges.
 */
function MainCollectionList({
  width = "full",
  verticalPadding = "none",
  ...rest
}: SectionProps) {
  const { collections } = useStorefrontContext();
  if (collections === undefined) return null;

  return <Section {...rest} verticalPadding={verticalPadding} width={width} />;
}

export default MainCollectionList;

export { schema } from "./schema";
