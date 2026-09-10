import { createSchema } from "@weaverse/schema";

export const schema = createSchema({
  type: "main-product",
  title: "Main product",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [],
  presets: {},
});
