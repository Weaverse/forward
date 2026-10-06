/**
 * The one translation resolver the server and the browser share.
 *
 * A key resolves in this order, highest first:
 * 1. a live Studio edit (flat dot-path keys, design mode only),
 * 2. the merchant's Translation Manager override for the current market,
 * 3. the theme's English `staticContent`,
 * 4. the key itself.
 *
 * Every step checks own properties, never truthiness: an intentionally empty
 * translation is the merchant's choice and is kept, and a key like
 * `constructor` must never resolve through `Object.prototype`. The SDK's own
 * lookup skips that check, which is why the theme does not use its `t`.
 */

export type TranslationVariables = Record<string, string | number>;

export interface TranslationSources {
  /** Unsaved Studio edits, keyed by full dot path. */
  designOverrides?: Readonly<Record<string, string>>;
  /** Published Translation Manager values for the current market (nested). */
  overrides?: Readonly<Record<string, unknown>> | null;
  /** The theme's English copy (nested). */
  staticContent: Readonly<Record<string, unknown>>;
}

function lookup(tree: unknown, path: string): string | undefined {
  let node = tree;
  for (const segment of path.split(".")) {
    if (
      node === null ||
      typeof node !== "object" ||
      !Object.hasOwn(node, segment)
    ) {
      return undefined;
    }
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(text: string, variables?: TranslationVariables): string {
  if (variables === undefined) {
    return text;
  }
  return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    Object.hasOwn(variables, name) ? String(variables[name]) : match,
  );
}

/** A resolved translation function over a known key set. */
export type Translate<Key extends string> = (
  key: Key,
  variables?: TranslationVariables,
) => string;

export function createTranslator<Key extends string>({
  designOverrides,
  overrides,
  staticContent,
}: TranslationSources): Translate<Key> {
  return function t(key, variables) {
    const design =
      designOverrides !== undefined && Object.hasOwn(designOverrides, key)
        ? designOverrides[key]
        : undefined;
    const text =
      (typeof design === "string" ? design : undefined) ??
      lookup(overrides, key) ??
      lookup(staticContent, key) ??
      key;
    return interpolate(text, variables);
  };
}
