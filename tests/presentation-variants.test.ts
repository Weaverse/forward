import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cartEmptyHeading,
  cartEmptyState,
  cartImage,
  cartLine,
  cartLineControls,
  cartLineHeading,
  cartQuantity,
  cartQuantityButton,
  cartRemoveButton,
  cartSummaryNote,
  cartSummaryRow,
  demoCartDisabledCta,
  demoCartPrimaryCta,
  shopifyCartDisabledCta,
  shopifyCartPrimaryCta,
} from "@/app/cart/presentation";
import {
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";

describe("shared presentation recipes", () => {
  it("keeps eyebrow tone output exact", () => {
    const base =
      "mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium";

    assert.equal(
      eyebrow(),
      `${base} text-signal-strong tracking-field-meta uppercase`,
    );
    assert.equal(
      eyebrow({ tone: "signal" }),
      `${base} text-signal tracking-field-meta uppercase`,
    );
    assert.equal(
      eyebrow({ tone: "warm" }),
      `${base} text-accent-warm tracking-field-meta uppercase`,
    );
  });

  it("keeps heading size output exact", () => {
    assert.equal(
      sectionHeading({ size: "display" }),
      "m-0 text-balance font-heading text-display leading-[0.94] font-medium tracking-heading",
    );
    assert.equal(
      sectionHeading(),
      "m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading",
    );
    assert.equal(
      sectionHeading({ size: "subsection" }),
      "m-0 text-balance font-heading text-heading-3 leading-[1.02] font-medium tracking-heading",
    );
    assert.equal(
      sectionHeading({ size: "subsectionSpaced" }),
      "mb-[18px] text-balance font-heading text-heading-3 leading-[1.02] font-medium tracking-heading",
    );
  });

  it("keeps CTA intent output exact", () => {
    const base =
      "inline-flex min-h-12 items-center justify-center gap-2.5 border";

    assert.equal(
      cta(),
      `${base} border-ink bg-ink px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-signal)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:shadow-[2px_2px_0_var(--color-signal)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0`,
    );
    assert.equal(
      cta({ intent: "signal" }),
      `${base} border-signal bg-signal px-[22px] py-3 font-body text-[11px] font-bold text-ink tracking-[0.09em] uppercase shadow-button [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:border-ink hover:bg-ink hover:text-signal hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0`,
    );
    assert.equal(
      cta({ intent: "light" }),
      `${base} border-text-inverse bg-transparent px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-text-inverse)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:bg-text-inverse hover:text-ink hover:shadow-[2px_2px_0_var(--color-text-inverse)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-text-inverse focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0`,
    );
    assert.equal(
      cta({ intent: "outline" }),
      `${base} border-ink bg-transparent px-[22px] py-3 font-body text-[11px] font-bold text-ink tracking-[0.09em] uppercase shadow-button [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:bg-ink hover:text-text-inverse hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0`,
    );
    assert.equal(
      cta({ intent: "demoCartPrimary" }),
      `${base} px-[22px] py-3 font-body text-[11px] font-bold tracking-[0.09em] uppercase shadow-button [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:border-ink hover:bg-ink hover:text-text-inverse hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0 border-ink bg-ink text-text-inverse shadow-[4px_4px_0_var(--color-signal)] hover:shadow-[2px_2px_0_var(--color-signal)] focus-visible:outline-signal`,
    );
  });

  it("keeps text-arrow link variants exact", () => {
    assert.equal(
      textLink(),
      "inline-flex min-h-touch items-center gap-[14px] border-ink border-b font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]",
    );
    assert.equal(
      textLink({ kind: "control" }),
      "inline-flex min-h-touch items-center gap-[14px] border-ink border-b bg-transparent font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]",
    );
  });

  it("keeps empty-state surface output exact", () => {
    assert.equal(
      emptyState({ size: "page" }),
      "grid min-h-[60svh] place-items-center bg-surface-subtle px-page-gutter py-[clamp(60px,10vw,140px)] text-center",
    );
    assert.equal(
      emptyState(),
      "grid min-h-[340px] place-items-center border border-ink bg-surface-subtle px-5 py-[60px] text-center",
    );
  });
});

describe("cart presentation recipes", () => {
  it("keeps static and Shopify cart primitives exact", () => {
    assert.equal(
      cartLine,
      "grid grid-cols-[190px_1fr_auto] gap-6 border-border-subtle border-b py-[22px] max-sm:grid-cols-[92px_1fr] max-sm:gap-3.5",
    );
    assert.equal(
      cartImage,
      "aspect-[4/5] w-[190px] object-cover saturate-[0.72] max-sm:w-[92px]",
    );
    assert.equal(
      cartLineHeading,
      "m-0 mb-1 text-balance font-heading text-[31px] font-medium",
    );
    assert.equal(
      cartLineControls,
      "mt-[18px] flex items-center gap-[15px] max-sm:flex-col max-sm:items-start",
    );
    assert.equal(
      cartQuantity,
      "grid h-11 w-28 grid-cols-[36px_1fr_36px] border border-border-dark-strong max-sm:h-12",
    );
    assert.equal(
      cartQuantityButton,
      "bg-transparent text-[20px] hover:bg-signal hover:text-ink",
    );
    assert.equal(
      cartRemoveButton,
      "min-h-touch bg-transparent text-[11px] text-text-muted underline underline-offset-[3px]",
    );
    assert.equal(
      cartSummaryRow,
      "flex justify-between gap-5 border-border-subtle border-b py-2.5",
    );
    assert.equal(cartSummaryNote, "mt-[14px] mb-5 text-[12px] text-text-muted");
    assert.equal(demoCartPrimaryCta, cta({ intent: "demoCartPrimary" }));
    assert.equal(shopifyCartPrimaryCta, cta());
    assert.equal(
      demoCartDisabledCta,
      `${demoCartPrimaryCta} w-full cursor-not-allowed opacity-[0.46] shadow-none`,
    );
    assert.equal(
      shopifyCartDisabledCta,
      `${shopifyCartPrimaryCta} w-full cursor-not-allowed opacity-[0.46] shadow-none`,
    );
    assert.equal(cartEmptyState, emptyState());
    assert.equal(
      cartEmptyHeading,
      "m-0 mb-[18px] text-balance font-heading text-heading-3 leading-[1.02] font-medium tracking-heading",
    );
  });
});
