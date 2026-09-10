import type { WeaverseNextThemeSchemaGroup } from "@weaverse/next";

/**
 * Global layout.
 *
 * `pageWidth` is the measure every `fixed`-width section is centred inside. It
 * is a theme setting rather than a per-section one because a storefront reads
 * as one page: sections disagreeing about their measure is the visual bug this
 * prevents.
 */
export const layoutSettings = {
  group: "Layout",
  inputs: [
    {
      type: "range",
      name: "pageWidth",
      label: "Page width",
      configs: { min: 1000, max: 1800, step: 20, unit: "px" },
    },
  ],
} as const satisfies WeaverseNextThemeSchemaGroup;
