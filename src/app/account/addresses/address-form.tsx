"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";

import {
  type AddressActionState,
  IDLE_ADDRESS_ACTION_STATE,
} from "@/lib/account/address-action-state";
import { saveAddress } from "@/lib/account/address-actions";

const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border border-ink bg-ink px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-signal)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:shadow-[2px_2px_0_var(--color-signal)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-signal focus-visible:outline-offset-4 disabled:translate-0 disabled:cursor-not-allowed disabled:opacity-[0.46] disabled:shadow-none motion-reduce:hover:translate-0 motion-reduce:active:translate-0";

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
