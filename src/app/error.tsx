"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <div
        data-surface="dark"
        className="border border-carbon bg-carbon px-6 py-14 text-cream sm:px-10 lg:py-20"
      >
        <p className="field-label text-acid">Field report / Error</p>
        <h1 className="display-huge mt-6">
          <span className="block">Weather</span>
          <span className="block italic">moved in.</span>
        </h1>
        <p className="mt-6 max-w-sm text-base leading-relaxed text-cream/75">
          An unexpected error interrupted this page.
        </p>
        {error.digest ? (
          <p className="field-label mt-3 text-cream/60">
            Reference / {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="field-label mt-8 inline-flex min-h-11 items-center bg-acid px-6 text-carbon transition-colors hover:bg-cream"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
