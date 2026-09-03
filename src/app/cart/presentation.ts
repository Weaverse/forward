import {
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
} from "@/lib/presentation/variants";

export const cartEyebrow = eyebrow();
export const cartPageHeading = sectionHeading({ size: "display" });
export const cartLine =
  "grid grid-cols-line-item gap-6 border-border-subtle border-b py-5.5 max-sm:grid-cols-line-item-compact max-sm:gap-3.5";
export const cartImage =
  "aspect-4/5 w-47.5 object-cover saturate-72 max-sm:w-23";
export const cartLineHeading =
  "m-0 mb-1 text-balance font-heading text-heading-3-fixed font-medium";
export const cartLineControls =
  "mt-4.5 flex items-center gap-3.75 max-sm:flex-col max-sm:items-start";
export const cartQuantity =
  "grid h-11 w-28 grid-cols-stepper border border-border-dark-strong max-sm:h-12";
export const cartQuantityButton =
  "bg-transparent text-control-lg hover:bg-signal hover:text-ink";
export const cartRemoveButton =
  "min-h-touch bg-transparent text-ui text-text-muted underline underline-offset-3";
export const cartSummaryRow =
  "flex justify-between gap-5 border-border-subtle border-b py-2.5";
export const cartSummaryTotal = `${cartSummaryRow} py-5 font-heading text-heading-4`;
export const cartSummaryNote = "mt-3.5 mb-5 text-caption text-text-muted";
export const cartPrimaryCta = cta();
export const cartDisabledCta = `${cartPrimaryCta} w-full cursor-not-allowed opacity-46 shadow-none`;
export const cartEmptyState = emptyState();
export const cartEmptyHeading =
  "m-0 mb-4.5 text-balance font-heading text-heading-3 leading-subheading font-medium tracking-heading";
