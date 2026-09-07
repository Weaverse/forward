import { cn } from "@/lib/cn";
import {
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
} from "@/lib/presentation/variants";

export const CART_EYEBROW = eyebrow();
export const CART_PAGE_HEADING = sectionHeading({ size: "display" });
export const CART_LINE =
  "grid grid-cols-line-item gap-6 border-border-subtle border-b py-5.5 max-sm:grid-cols-line-item-compact max-sm:gap-3.5";
export const CART_IMAGE =
  "aspect-4/5 w-47.5 object-cover saturate-72 max-sm:w-23";
export const CART_LINE_HEADING =
  "m-0 mb-1 text-balance font-heading text-heading-3-fixed font-medium";
export const CART_LINE_CONTROLS =
  "mt-4.5 flex items-center gap-3.75 max-sm:flex-col max-sm:items-start";
export const CART_QUANTITY =
  "grid h-11 w-28 grid-cols-stepper border border-border-dark-strong max-sm:h-12";
export const CART_QUANTITY_BUTTON =
  "bg-transparent text-control-lg hover:bg-signal hover:text-ink";
export const CART_REMOVE_BUTTON =
  "min-h-touch bg-transparent text-ui text-text-muted underline underline-offset-3";
export const CART_SUMMARY_ROW =
  "flex justify-between gap-5 border-border-subtle border-b py-2.5";
export const CART_SUMMARY_TOTAL = cn(
  CART_SUMMARY_ROW,
  "py-5 font-heading text-heading-4",
);
export const CART_SUMMARY_NOTE = "mt-3.5 mb-5 text-caption text-text-muted";
export const CART_PRIMARY_CTA = cta();
export const CART_DISABLED_CTA = cn(
  CART_PRIMARY_CTA,
  "w-full cursor-not-allowed opacity-46 shadow-none",
);
export const CART_EMPTY_STATE = emptyState();
export const CART_EMPTY_HEADING =
  "m-0 mb-4.5 text-balance font-heading text-heading-3 leading-subheading font-medium tracking-heading";
