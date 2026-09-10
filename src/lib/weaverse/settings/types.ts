/**
 * Typed theme settings, derived from the setting groups themselves.
 *
 * Each group is declared `as const satisfies WeaverseNextThemeSchemaGroup`, so
 * its input names and types survive as literals. These helpers walk that tuple
 * and produce the object a consumer actually reads, which means the settings
 * type can never drift from the schema Builder renders: adding an input to a
 * group adds it here, and renaming one breaks every consumer at compile time.
 */

import type { editorialImagerySettings } from "./editorial-imagery";
import type { footerSettings } from "./footer";
import type { headerSettings } from "./header";
import type { layoutSettings } from "./layout";

/** A Weaverse image value as it arrives from Builder. */
export interface WeaverseImageValue {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

/** Extracts the literal union from a `configs.options` tuple. */
type ExtractOptionValues<T> = T extends {
  configs: { options: readonly (infer O)[] };
}
  ? O extends { value: infer V extends string }
    ? V
    : string
  : string;

/** Maps one input entry to the TypeScript value Builder stores for it. */
type InputValue<T> = T extends { type: "switch" }
  ? boolean
  : T extends { type: "range" }
    ? number
    : T extends { type: "image" | "video" }
      ? WeaverseImageValue
      : T extends { type: "select" | "toggle-group" }
        ? ExtractOptionValues<T>
        : T extends { type: "heading" }
          ? never
          : T extends {
                type: "text" | "textarea" | "richtext" | "url" | "color";
              }
            ? string
            : unknown;

/**
 * Walks an inputs tuple, keeps the entries that have a `name`, and maps each
 * to its value type. Indexing with `T[number]` keeps every union member
 * distributing independently instead of collapsing into one.
 */
type SettingsFromInputs<T extends readonly unknown[]> = {
  [K in T[number] as K extends { name: infer N extends string }
    ? N
    : never]: K extends unknown ? InputValue<K> : never;
};

/** Extracts the typed settings of one `as const satisfies` group. */
export type ExtractSettings<T extends { inputs: readonly unknown[] }> =
  SettingsFromInputs<T["inputs"]>;

export type LayoutSettings = ExtractSettings<typeof layoutSettings>;
export type HeaderSettings = ExtractSettings<typeof headerSettings>;
export type FooterSettings = ExtractSettings<typeof footerSettings>;
export type EditorialImagerySettings = ExtractSettings<
  typeof editorialImagerySettings
>;

/** Every theme setting this theme declares. */
export type ThemeSettings = LayoutSettings &
  HeaderSettings &
  FooterSettings &
  EditorialImagerySettings;
