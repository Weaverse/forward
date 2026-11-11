import { createTranslate } from "@weaverse/hydrogen/next";

/**
 * The one translation resolver the server and the browser share: the SDK's
 * `createTranslate`, which the Weaverse root provider's `t` also uses.
 *
 * A key resolves in this order, highest first: a live Studio edit, the
 * merchant's Translation Manager override for the current market, the theme's
 * English `staticContent`, then the key itself. An intentionally empty
 * translation is kept, and a key like `constructor` never resolves through
 * `Object.prototype`. This wrapper only types the key set and accepts the
 * `null` overrides `useTranslation` reports.
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
  return createTranslate({
    designOverrides,
    merchantOverrides: overrides ?? undefined,
    staticContent,
  });
}
