import type { WeaverseNextThemeSchemaGroup } from "@weaverse/next";

/**
 * Header theme settings.
 *
 * The Header is a theme-owned component, never a Weaverse global section, so
 * everything a merchant may change about it lives here. Layout, geometry,
 * ordering, keyboard behavior, and the fail-soft navigation safeguards stay in
 * code and are deliberately not settings.
 */
export const headerSettings = {
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
} as const satisfies WeaverseNextThemeSchemaGroup;
