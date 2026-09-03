import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cartDisabledCta,
  cartEmptyHeading,
  cartEmptyState,
  cartImage,
  cartLine,
  cartLineControls,
  cartLineHeading,
  cartPrimaryCta,
  cartQuantity,
  cartQuantityButton,
  cartRemoveButton,
  cartSummaryNote,
  cartSummaryRow,
} from "@/app/cart/presentation";
import {
  controlTransition,
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";

describe("shared presentation recipes", () => {
  it("keeps eyebrow tone output exact", () => {
    const base = "mb-3.5 font-field-meta text-ui leading-meta font-medium";

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
      "m-0 text-balance font-heading text-display leading-display font-medium tracking-heading",
    );
    assert.equal(
      sectionHeading(),
      "m-0 text-balance font-heading text-heading-2 leading-heading font-medium tracking-heading",
    );
    assert.equal(
      sectionHeading({ size: "subsection" }),
      "m-0 text-balance font-heading text-heading-3 leading-subheading font-medium tracking-heading",
    );
    assert.equal(
      sectionHeading({ size: "subsectionSpaced" }),
      "mb-4.5 text-balance font-heading text-heading-3 leading-subheading font-medium tracking-heading",
    );
  });

  it("keeps CTA intent output exact", () => {
    const base = `inline-flex min-h-12 items-center justify-center gap-2.5 border ${controlTransition}`;

    assert.equal(
      cta(),
      `${base} border-ink bg-ink px-5.5 py-3 font-body text-ui font-bold text-text-inverse tracking-button uppercase shadow-button-signal hover:translate-0.5 hover:shadow-button-signal-hover active:translate-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0`,
    );
    assert.equal(
      cta({ intent: "signal" }),
      `${base} border-signal bg-signal px-5.5 py-3 font-body text-ui font-bold text-ink tracking-button uppercase shadow-button hover:translate-0.5 hover:border-ink hover:bg-ink hover:text-signal hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0`,
    );
    assert.equal(
      cta({ intent: "light" }),
      `${base} border-text-inverse bg-transparent px-5.5 py-3 font-body text-ui font-bold text-text-inverse tracking-button uppercase shadow-button-inverse hover:translate-0.5 hover:bg-text-inverse hover:text-ink hover:shadow-button-inverse-hover active:translate-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-text-inverse focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0`,
    );
    assert.equal(
      cta({ intent: "outline" }),
      `${base} border-ink bg-transparent px-5.5 py-3 font-body text-ui font-bold text-ink tracking-button uppercase shadow-button hover:translate-0.5 hover:bg-ink hover:text-text-inverse hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-3 focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0`,
    );
  });

  it("declares one shadow, hover shadow, and focus outline colour per CTA intent", () => {
    /* `cn()` is a plain join, so a second shadow or outline colour in the same
     * class list is resolved by Tailwind's emission order, not authoring
     * order. Every intent must state its winner exactly once. */
    const intents = ["primary", "signal", "light", "outline"] as const;

    for (const intent of intents) {
      const classes = cta({ intent }).split(" ");
      const matching = (pattern: RegExp) =>
        classes.filter((className) => pattern.test(className));

      assert.equal(matching(/^shadow-/).length, 1, intent);
      assert.equal(matching(/^hover:shadow-/).length, 1, intent);
      assert.equal(
        matching(/^focus-visible:outline-(?:ink|signal|text-inverse)$/).length,
        1,
        intent,
      );
    }
  });

  it("keeps text-arrow link variants exact", () => {
    assert.equal(
      textLink(),
      "inline-flex min-h-touch items-center gap-3.5 border-ink border-b font-body text-ui font-medium tracking-link uppercase after:text-control-lg after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-1.25",
    );
    assert.equal(textLink({ kind: "control" }), `${textLink()} bg-transparent`);
  });

  it("keeps empty-state surface output exact", () => {
    assert.equal(
      emptyState({ size: "page" }),
      "grid min-h-state-min place-items-center bg-surface-subtle px-page-gutter py-[clamp(60px,10vw,140px)] text-center",
    );
    assert.equal(
      emptyState(),
      "grid min-h-85 place-items-center border border-ink bg-surface-subtle px-5 py-15 text-center",
    );
  });
});

describe("cart presentation recipes", () => {
  it("keeps static and Shopify cart primitives exact", () => {
    assert.equal(
      cartLine,
      "grid grid-cols-line-item gap-6 border-border-subtle border-b py-5.5 max-sm:grid-cols-line-item-compact max-sm:gap-3.5",
    );
    assert.equal(
      cartImage,
      "aspect-4/5 w-47.5 object-cover saturate-72 max-sm:w-23",
    );
    assert.equal(
      cartLineHeading,
      "m-0 mb-1 text-balance font-heading text-heading-3-fixed font-medium",
    );
    assert.equal(
      cartLineControls,
      "mt-4.5 flex items-center gap-3.75 max-sm:flex-col max-sm:items-start",
    );
    assert.equal(
      cartQuantity,
      "grid h-11 w-28 grid-cols-stepper border border-border-dark-strong max-sm:h-12",
    );
    assert.equal(
      cartQuantityButton,
      "bg-transparent text-control-lg hover:bg-signal hover:text-ink",
    );
    assert.equal(
      cartRemoveButton,
      "min-h-touch bg-transparent text-ui text-text-muted underline underline-offset-3",
    );
    assert.equal(
      cartSummaryRow,
      "flex justify-between gap-5 border-border-subtle border-b py-2.5",
    );
    assert.equal(cartSummaryNote, "mt-3.5 mb-5 text-caption text-text-muted");
    assert.equal(cartPrimaryCta, cta());
    assert.equal(
      cartDisabledCta,
      `${cartPrimaryCta} w-full cursor-not-allowed opacity-46 shadow-none`,
    );
    assert.equal(cartEmptyState, emptyState());
    assert.equal(
      cartEmptyHeading,
      "m-0 mb-4.5 text-balance font-heading text-heading-3 leading-subheading font-medium tracking-heading",
    );
  });
});
