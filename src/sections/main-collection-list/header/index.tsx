"use client";

import { Section, type SectionProps } from "@/components/section";

/** The collection list's heading and lede, on the page measure. */
function CollectionListHeader({
  width = "fixed",
  verticalPadding = "compact",
  ...rest
}: SectionProps) {
  return <Section {...rest} verticalPadding={verticalPadding} width={width} />;
}

export default CollectionListHeader;

export { schema } from "./schema";
