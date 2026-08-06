"use client";

/**
 * Error state. The canonical POC has no error render function, so this uses
 * the canonical tokens, type scale, and system-state geometry rather than a
 * new art direction. Reset behavior and status semantics are unchanged.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="system-state">
      <div className="system-state-inner" role="alert">
        <p className="eyebrow">Field report / Error</p>
        <h1 className="h2">Weather moved in.</h1>
        <p className="lede">An unexpected error interrupted this page.</p>
        {error.digest ? (
          <p className="meta">Reference / {error.digest}</p>
        ) : null}
        <button className="button button-signal" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
