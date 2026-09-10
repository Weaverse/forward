import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "main-product",
  title: "Main product",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  /* No settings. The buy block's behaviour is variant identity, query state
   * and the cart handoff, none of which is a merchant's to configure; what is
   * theirs is where the block sits among the product page's sections. */
  settings: [],
  presets: {},
});
