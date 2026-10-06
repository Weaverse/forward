import type { WeaverseNextThemeSchemaGroup } from "@weaverse/next";

/**
 * Footer theme settings. The tagline is a translation key (`footer.tagline`),
 * not a setting, so it can differ per market in the Translation Manager.
 */
export const footerSettings = {
  group: "Footer",
  inputs: [
    {
      type: "text",
      name: "footerMenuHandle",
      label: "Shopify footer menu handle",
      defaultValue: "footer",
    },
  ],
} as const satisfies WeaverseNextThemeSchemaGroup;
