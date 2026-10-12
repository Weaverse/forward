"use client";

import { Section, type SectionProps } from "@/components/section";

/**
 * The catalog's heading and lede, on the page measure.
 *
 * The `all-products` shell runs full width for the toolbar's sake, so the
 * header carries its own container rather than inheriting one.
 */
function AllProductsHeader({
  width = "fixed",
  verticalPadding = "compact",
  ...rest
}: SectionProps) {
  return <Section {...rest} verticalPadding={verticalPadding} width={width} />;
}

export default AllProductsHeader;

export { schema } from "./schema";
