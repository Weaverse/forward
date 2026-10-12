"use client";

import type { VariantProps } from "class-variance-authority";

import { Section, type SectionProps } from "@/components/section";
import { browseShell } from "@/lib/presentation/variants";

interface AllProductsProps extends SectionProps {
  spacing?: VariantProps<typeof browseShell>["spacing"];
}

/**
 * The whole-catalog browse block.
 *
 * Order and paging are query state the route resolves; this shell owns layout
 * and nothing else. It runs full width by default because the toolbar is
 * full-bleed by design; the heading and lede sit in `ap--header`, which keeps
 * them on the page measure.
 */
function AllProducts({
  spacing,
  width = "full",
  verticalPadding = "none",
  ...rest
}: AllProductsProps) {
  return (
    <Section
      {...rest}
      className={browseShell({ spacing })}
      verticalPadding={verticalPadding}
      width={width}
    />
  );
}

export default AllProducts;

export { schema } from "./schema";
