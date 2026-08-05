import Link from "next/link";

import type { ShellProduct } from "@/lib/shell-fixtures";

export function ProductTile({ product }: { product: ShellProduct }) {
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col border border-mist bg-parchment transition-colors hover:border-pine"
    >
      <span
        aria-hidden="true"
        className="flex aspect-[4/5] items-center justify-center bg-mist/50 font-display text-4xl font-semibold uppercase text-moss/60"
      >
        {product.title.charAt(0)}
      </span>
      <span className="flex flex-1 flex-col gap-1 px-4 py-4">
        <span className="text-sm font-semibold uppercase tracking-[0.08em] text-pine group-hover:text-clay">
          {product.title}
        </span>
        <span className="text-sm leading-snug text-slate">
          {product.tagline}
        </span>
        <span className="mt-2 text-xs uppercase tracking-[0.12em] text-moss">
          {product.priceLabel}
        </span>
      </span>
    </Link>
  );
}
