import Link from "next/link";

import { ProductTile } from "@/components/product-tile";
import { SMOKE_FIXTURES } from "@/lib/routes/route-contract";
import { SHELL_ARTICLE, SHELL_PRODUCTS } from "@/lib/shell-fixtures";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <section className="border border-mist bg-pine px-6 py-14 text-bone sm:px-12 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-light">
          Forward — Fall 2026
        </p>
        <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold uppercase leading-[1.05] tracking-[0.04em] sm:text-5xl">
          Gear for the way out
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-bone/85">
          Shells, packs, and footwear made for weather that changes its mind.
          Move light, stay out longer, come back tired in the good way.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="bg-clay px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-bone transition-colors hover:bg-clay-deep"
          >
            Shop the collection
          </Link>
          <Link
            href="/journal"
            className="border border-bone/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-bone transition-colors hover:border-bone"
          >
            Read the journal
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.04em] text-pine">
            Field-tested essentials
          </h2>
          <Link
            href={`/shop/${SMOKE_FIXTURES.collectionHandle}`}
            className="text-sm font-medium uppercase tracking-[0.12em] text-clay hover:text-clay-deep"
          >
            View field gear
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {SHELL_PRODUCTS.map((product) => (
            <ProductTile key={product.handle} product={product} />
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-5 sm:grid-cols-2">
        <Link
          href={`/journal/${SHELL_ARTICLE.handle}`}
          className="group border border-mist bg-parchment px-6 py-8 transition-colors hover:border-pine"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
            From the journal
          </p>
          <h3 className="mt-3 font-display text-xl font-semibold uppercase tracking-[0.04em] text-pine group-hover:text-clay">
            {SHELL_ARTICLE.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate">
            {SHELL_ARTICLE.excerpt}
          </p>
        </Link>
        <div className="border border-mist bg-parchment px-6 py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
            Foundation slice
          </p>
          <h3 className="mt-3 font-display text-xl font-semibold uppercase tracking-[0.04em] text-pine">
            Built ahead of live data
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate">
            This storefront shell ships before its Shopify, Customer Account,
            and Weaverse Studio integrations. Every surface states the live data
            it is waiting on.
          </p>
        </div>
      </section>
    </div>
  );
}
