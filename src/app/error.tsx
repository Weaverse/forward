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
      <div className="max-w-state" role="alert">
        <p className={eyebrow()}>Field report / Error</p>
        <h1 className={sectionHeading()}>Weather moved in.</h1>
        <p className="max-w-lede text-lede leading-lede text-text-muted">
          An unexpected error interrupted this page.
        </p>
        {error.digest ? (
          <p className="font-field-meta text-caption font-medium text-text-muted tracking-field-meta uppercase">
            Reference / {error.digest}
          </p>
        ) : null}
        <button className={cta()} type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
