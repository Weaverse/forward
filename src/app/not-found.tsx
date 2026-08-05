import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-24 text-center sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
        404 — Off the map
      </p>
      <h1 className="mt-4 font-display text-4xl font-semibold uppercase tracking-[0.04em] text-pine">
        This trail does not exist
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate">
        The page you are looking for has moved, was renamed, or never made it
        onto the route map.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block bg-clay px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-bone transition-colors hover:bg-clay-deep"
      >
        Back to base
      </Link>
    </div>
  );
}
