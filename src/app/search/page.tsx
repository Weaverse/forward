import type { Metadata } from "next";

import { SurfaceShell } from "@/components/surface-shell";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Forward catalog and journal.",
};

export default function SearchPage() {
  return (
    <SurfaceShell
      eyebrow="Search"
      title="Find your gear"
      description="Search across products, collections, and journal entries once live search lands."
      dataDependency="This surface will query Shopify predictive and full-text search. The form below submits nowhere yet — it exists to review layout and focus behavior."
    >
      <form action="/search" method="get" className="max-w-xl">
        <label
          htmlFor="search-input"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-moss"
        >
          Search the store
        </label>
        <div className="mt-2 flex">
          <input
            id="search-input"
            type="search"
            name="q"
            placeholder="Shells, packs, trail shoes…"
            className="w-full border border-mist bg-parchment px-4 py-3 text-sm text-ink placeholder:text-slate/60"
          />
          <button
            type="submit"
            className="shrink-0 bg-pine px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-bone transition-colors hover:bg-pine-deep"
          >
            Search
          </button>
        </div>
      </form>
    </SurfaceShell>
  );
}
