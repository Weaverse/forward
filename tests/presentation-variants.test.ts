import assert from "node:assert/strict";
import { it } from "node:test";

import { cta, textLink } from "@/lib/presentation/variants";

const TONES = ["dark", "light"] as const;

it("declares one shadow, one border and one focus outline per CTA", () => {
  for (const tone of TONES) {
    const classes = cta({ tone }).split(" ");
    const matching = (pattern: RegExp) =>
      classes.filter((className) => pattern.test(className));

    assert.equal(matching(/^shadow-/).length, 1, tone);
    assert.equal(matching(/^border-/).length, 1, tone);
    assert.equal(
      matching(/^focus-visible:outline-(?:ink|signal|text-inverse)$/).length,
      1,
      tone,
    );
  }
});

it("never moves or reshapes the CTA on hover", () => {
  /* Hover may tint. What it may not do is move the button or change its
   * shadow: that combination read as a bounce and was removed on purpose.
   * Pressing is where the motion lives now. */
  for (const tone of TONES) {
    const hovers = cta({ tone })
      .split(" ")
      .filter((className) => className.startsWith("hover:"));

    assert.deepEqual(
      hovers.filter((c) => /translate|shadow|scale|rotate/.test(c)),
      [],
      tone,
    );
  }
});

it("moves the CTA only when it is pressed", () => {
  const classes = cta().split(" ");

  assert.ok(classes.includes("active:translate-1"));
  assert.ok(classes.includes("active:shadow-none"));
  assert.ok(classes.includes("motion-reduce:active:translate-none"));
});

it("changes only the shadow when the tone changes", () => {
  /* `tone` answers one question — what has to read against the background —
   * and the shadow is the only thing that answers it. Fill, border, text and
   * geometry are fixed. */
  const dark = new Set(cta({ tone: "dark" }).split(" "));
  const light = new Set(cta({ tone: "light" }).split(" "));
  const changed = [...dark, ...light].filter(
    (className) => !(dark.has(className) && light.has(className)),
  );

  assert.ok(changed.length > 0, "the two tones render identically");
  assert.ok(
    changed.every((className) => className.startsWith("shadow-")),
    `tone changed something other than the shadow: ${changed.join(" ")}`,
  );
});

it("never lets the CTA shadow match the CTA fill", () => {
  /* The reason the solid-ink fill was dropped: on a light ground its only
   * usable shadow was ink, and an ink block behind an ink button is not a
   * shadow. The fill is signal, so no tone may reach for a signal shadow. */
  assert.ok(cta().split(" ").includes("bg-signal"));

  for (const tone of TONES) {
    assert.equal(cta({ tone }).includes("shadow-button-signal"), false, tone);
  }
});

it("keeps the arrow, and drops only the rule, when the border is off", () => {
  const withBorder = textLink();
  const without = textLink({ showBorder: false });

  assert.ok(withBorder.includes("border-b"));
  assert.equal(without.includes("border-b"), false);
  for (const link of [withBorder, without]) {
    assert.ok(link.includes("after:content-['→']"));
  }
});
