import type { WeaverseNextThemeSchemaGroup } from "@weaverse/next";

/**
 * Footer theme settings.
 *
 * `footerStatus` and `demoNotice` describe the deployment's real integration
 * state. They are merchant-editable copy, but they must stay truthful: a
 * storefront that claims a live checkout it does not have is a defect, not a
 * marketing choice.
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
      name: "footerStatus",
      label: "Integration status",
      helpText:
        "Must stay truthful about the deployment's real integration state.",
    },
    {
      type: "text",
      name: "demoNotice",
      label: "Demo notice",
      helpText:
        "Must stay truthful about the deployment's real integration state.",
    },
    {
      type: "text",
      name: "footerMenuHandle",
      label: "Shopify footer menu handle",
      defaultValue: "footer",
    },
  ],
} as const satisfies WeaverseNextThemeSchemaGroup;
