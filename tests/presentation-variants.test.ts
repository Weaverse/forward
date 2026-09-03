import assert from "node:assert/strict";
import { it } from "node:test";

import { cta } from "@/lib/presentation/variants";

it("declares one shadow, hover shadow, and focus outline per CTA intent", () => {
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
