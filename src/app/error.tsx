"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-24 text-center sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
        Something went sideways
      </p>
      <h1 className="mt-4 font-display text-4xl font-semibold uppercase tracking-[0.04em] text-pine">
        Weather moved in
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate">
        An unexpected error interrupted this page.
        {error.digest ? ` Reference: ${error.digest}.` : ""}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-block bg-clay px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-bone transition-colors hover:bg-clay-deep"
      >
        Try again
      </button>
    </div>
  );
}
