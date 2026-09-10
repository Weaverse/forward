import { createSchema } from "@weaverse/schema";

import { layoutInputs } from "@/components/section/inputs";

export const schema = createSchema({
  type: "main-product",
  title: "Main product",
  limit: 1,
  enabledOn: { pages: ["PRODUCT"] },
  settings: [{ group: "Layout", inputs: layoutInputs }],
  presets: {},
});
