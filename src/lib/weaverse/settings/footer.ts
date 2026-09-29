import type { WeaverseNextThemeSchemaGroup } from "@weaverse/next";

/**
 * Footer theme settings.

 */
export const footerSettings = {
  group: "Footer",
  inputs: [
    {
      type: "text",
      name: "footerTagline",
      label: "Tagline",
    },
    {
      type: "text",
      name: "footerMenuHandle",
      label: "Shopify footer menu handle",
      defaultValue: "footer",
    },
  ],
} as const satisfies WeaverseNextThemeSchemaGroup;
