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
    <div className="system-state grid min-h-[60svh] place-items-center bg-surface-subtle px-page-gutter py-[clamp(60px,10vw,140px)] text-center">
      <div className="max-w-[560px]" role="alert">
        <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
          Field report / Error
        </p>
        <h1 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
          Weather moved in.
        </h1>
        <p className="max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
          An unexpected error interrupted this page.
        </p>
        {error.digest ? (
          <p className="font-field-meta text-[12px] font-medium text-text-muted tracking-field-meta uppercase">
            Reference / {error.digest}
          </p>
        ) : null}
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-signal bg-signal px-[22px] py-3 font-body text-[11px] font-bold text-ink tracking-[0.09em] uppercase shadow-button [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:border-ink hover:bg-ink hover:text-signal hover:shadow-button-hover active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-ink focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0"
          type="button"
          onClick={reset}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
