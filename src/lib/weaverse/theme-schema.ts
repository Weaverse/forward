/**
 * Forward's Weaverse theme schema.
 *
 * The contract makes Header and Footer settings-owned rather than
 * section-owned, so the global surfaces appear here as setting groups. Every
 * entry maps to something Forward renders today; layout, geometry, ordering,
 * and accessibility behavior are deliberately not settings.
 *
 * Defaults mirror the current `ThemeContent` values so an unconfigured project
 * renders what the storefront already renders.
 */

import type { WeaverseNextThemeSchema } from "@weaverse/next";

export const themeSchema: WeaverseNextThemeSchema = {
  info: {
    name: "Forward",
    version: "0.1.0",
  },
  settings: [
    {
      group: "Header",
      inputs: [
        {
          type: "text",
          name: "announcement",
          label: "Announcement bar text",
        },
        {
          type: "text",
          name: "mainMenuHandle",
          label: "Shopify menu handle",
          defaultValue: "main-menu",
          helpText:
            "Which Shopify menu feeds the header. Structure and fail-soft safeguards stay in code.",
        },
        {
          type: "image",
          name: "wordmark",
          label: "Wordmark",
        },
        {
          type: "switch",
          name: "showCountrySelector",
          label: "Show country selector",
          defaultValue: true,
        },
      ],
    },
    {
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
    },
    {
      group: "Editorial imagery",
      inputs: [
        {
          type: "image",
          name: "homeHeroImage",
          label: "Home hero image",
        },
        {
          type: "image",
          name: "standardBandImage",
          label: "Material standard image",
        },
      ],
    },
  ],
};
