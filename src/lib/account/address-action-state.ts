/** Client-safe state shared by the address form and its Server Action. */

export interface AddressActionState {
  message: string | null;
}

export const IDLE_ADDRESS_ACTION_STATE: AddressActionState = { message: null };
