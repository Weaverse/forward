import { createSchema } from "@weaverse/hydrogen/next";

/** Same identity as the SDK's default root, so existing pages keep resolving. */
export const schema = createSchema({
  type: "main",
  title: "Main",
});
