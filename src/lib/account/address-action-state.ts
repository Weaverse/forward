/** Client-safe state shared by the address form and its Server Action. */

import type { TranslationKey } from "@/lib/i18n/static-content";
import type { TranslationVariables } from "@/lib/i18n/translate";

export interface AddressActionState {
  /** A translation key; the form renders it in the shopper's market. */
  message: TranslationKey | null;
  /** Values the message interpolates. */
  variables?: TranslationVariables;
}

export const IDLE_ADDRESS_ACTION_STATE: AddressActionState = { message: null };
