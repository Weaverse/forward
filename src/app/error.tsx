"use client";

import {
  cta,
  emptyState,
  eyebrow,
  sectionHeading,
} from "@/lib/presentation/variants";

/** Error state with the accepted geometry, reset behavior, and semantics. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={emptyState({ size: "page" })}>
      <div className="max-w-[560px]" role="alert">
        <p className={eyebrow()}>Field report / Error</p>
        <h1 className={sectionHeading()}>Weather moved in.</h1>
        <p className="max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
          An unexpected error interrupted this page.
        </p>
        {error.digest ? (
          <p className="font-field-meta text-[12px] font-medium text-text-muted tracking-field-meta uppercase">
            Reference / {error.digest}
          </p>
        ) : null}
        <button
          className={cta({ intent: "signal" })}
          type="button"
          onClick={reset}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
