/** Client-safe state shared by the address form and its Server Action. */

import type { TranslationKey } from "@/lib/i18n/static-content";

export interface AddressActionState {
  /** A translation key; the form renders it in the shopper's market. */
  message: TranslationKey | null;
}

export const IDLE_ADDRESS_ACTION_STATE: AddressActionState = { message: null };
