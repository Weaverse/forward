"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";

import {
  type AddressActionState,
  IDLE_ADDRESS_ACTION_STATE,
} from "@/lib/account/address-action-state";
import { saveAddress } from "@/lib/account/address-actions";
import { cta } from "@/lib/presentation/variants";

const PRIMARY_BUTTON_CLASS = `${cta()} disabled:translate-0 disabled:cursor-not-allowed disabled:opacity-[0.46] disabled:shadow-none`;

interface AddressActionFormProps {
  /** Hidden intent/id inputs and any visible fields, rendered on the server. */
  children?: ReactNode;
  submitLabel: string;
  submitClassName?: string;
  className?: string;
}

/**
 * One address submission.
 *
 * A plain `<form>` posting to the Server Action, so it works without client
 * JavaScript; the only state here is the action's own generic message, scoped
 * to the form that produced it. The submit button is disabled while the
 * request is in flight — this is the one place a duplicate write could come
 * from, and nothing ever re-issues a submission automatically.
 */
export function AddressActionForm({
  children,
  submitLabel,
  submitClassName,
  className,
}: AddressActionFormProps) {
  const [state, formAction, pending] = useActionState<
    AddressActionState,
    FormData
  >(saveAddress, IDLE_ADDRESS_ACTION_STATE);

  return (
    <form action={formAction} className={className}>
      {children}
      <button
        type="submit"
        className={submitClassName ?? PRIMARY_BUTTON_CLASS}
        disabled={pending}
      >
        {submitLabel}
      </button>
      {state.message === null ? null : (
        <p className="text-[12px] text-text-dark-muted" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
