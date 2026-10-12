"use client";

import type { VariantProps } from "class-variance-authority";

import { Section, type SectionProps } from "@/components/section";
import { browseShell } from "@/lib/presentation/variants";

import { useStorefrontContext } from "@/lib/weaverse/data-context";

interface MainCollectionProps extends SectionProps {
  spacing?: VariantProps<typeof browseShell>["spacing"];
}

/**
 * The collection browse block, composed from `mc--toolbar` and `mc--content`.
 *
 * The shell owns layout and nothing else. Filter and sort are query state the
 * route resolves and validates before any product is read, and it arrives here
 * through the storefront data context — so a merchant reordering this tree can
 * never change what a filter means or which products a URL selects. It runs
 * full width by default because the toolbar is full-bleed by design.
 */
function MainCollection({
  spacing,
  width = "full",
  verticalPadding = "none",
  ...rest
}: MainCollectionProps) {
  const { collection } = useStorefrontContext();
  if (collection === undefined) return null;

  return (
    <Section
      {...rest}
      className={browseShell({ spacing })}
      verticalPadding={verticalPadding}
      width={width}
    />
  );
}

export default MainCollection;

export { schema } from "./schema";
