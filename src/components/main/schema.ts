import { createSchema } from "@weaverse/next";

/** Same identity as the SDK's default root, so existing pages keep resolving. */
export const schema = createSchema({
  type: "main",
  title: "Main",
});
