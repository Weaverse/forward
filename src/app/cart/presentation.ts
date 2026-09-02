import {
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
} from "@/lib/presentation/variants";

export const cartEyebrow = eyebrow();
export const cartPageHeading = sectionHeading({ size: "display" });
export const cartLine =
  "grid grid-cols-[190px_1fr_auto] gap-6 border-border-subtle border-b py-[22px] max-sm:grid-cols-[92px_1fr] max-sm:gap-3.5";
export const cartImage =
  "aspect-[4/5] w-[190px] object-cover saturate-[0.72] max-sm:w-[92px]";
export const cartLineHeading =
  "m-0 mb-1 text-balance font-heading text-[31px] font-medium";
export const cartLineControls =
  "mt-[18px] flex items-center gap-[15px] max-sm:flex-col max-sm:items-start";
export const cartQuantity =
  "grid h-11 w-28 grid-cols-[36px_1fr_36px] border border-border-dark-strong max-sm:h-12";
export const cartQuantityButton =
  "bg-transparent text-[20px] hover:bg-signal hover:text-ink";
export const cartRemoveButton =
  "min-h-touch bg-transparent text-[11px] text-text-muted underline underline-offset-[3px]";
export const cartSummaryRow =
  "flex justify-between gap-5 border-border-subtle border-b py-2.5";
export const cartSummaryTotal = `${cartSummaryRow} py-5 font-heading text-[27px]`;
export const cartSummaryNote = "mt-[14px] mb-5 text-[12px] text-text-muted";
export const demoCartPrimaryCta = cta({ intent: "demoCartPrimary" });
export const shopifyCartPrimaryCta = cta();
export const demoCartDisabledCta = `${demoCartPrimaryCta} w-full cursor-not-allowed opacity-[0.46] shadow-none`;
export const shopifyCartDisabledCta = `${shopifyCartPrimaryCta} w-full cursor-not-allowed opacity-[0.46] shadow-none`;
export const cartEmptyState = emptyState();
export const cartEmptyHeading =
  "m-0 mb-[18px] text-balance font-heading text-heading-3 leading-[1.02] font-medium tracking-heading";
