import type { WeaverseNextThemeSchemaGroup } from "@weaverse/next";

/**
 * Editorial imagery used by more than one surface.
 *
 * These stay theme settings only while `INDEX` composition is pending. Once
 * `home-hero` and `material-standard` own their own image settings, the two
 * entries move onto those sections and this group goes away.
 */
export const editorialImagerySettings = {
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
} as const satisfies WeaverseNextThemeSchemaGroup;
