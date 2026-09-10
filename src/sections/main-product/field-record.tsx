"use client";

import Link from "next/link";

import { textLink } from "@/lib/presentation/variants";
import type { Product } from "@/lib/storefront/types";

/**
 * The disclosure stack under the buy block.
 *
 * It reads only from the product, so it moved out of the route with the rest
 * of the block. Splitting its four panels into separate Studio items is a
 * separate decision and needs its own argument.
 */
export function ProductFieldRecord({ product }: { product: Product }) {
  return (
    <div className="mt-7.5 border-border-dark border-t">
      <details className="group border-border-dark border-b" open>
        <summary className="flex min-h-13.5 list-none items-center justify-between font-body text-micro font-medium tracking-control uppercase after:text-copy-lg after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
          Why it works
        </summary>
        {product.detailParagraphs.map((paragraph) => (
          <p
            className="text-label text-text-dark-muted"
            key={paragraph.slice(0, 32)}
          >
            {paragraph}
          </p>
        ))}
      </details>
      <details className="group border-border-dark border-b">
        <summary className="flex min-h-13.5 list-none items-center justify-between font-body text-micro font-medium tracking-control uppercase after:text-copy-lg after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
          Specifications
        </summary>
        <dl>
          {product.specs.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-5 border-border-dark border-b py-2.25 text-caption last:border-b-0"
            >
              <dt className="font-body text-micro text-text-dark-muted tracking-label uppercase">
                {row.label}
              </dt>
              <dd className="m-0 text-right text-text-inverse">{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
      <details className="group border-border-dark border-b">
        <summary className="flex min-h-13.5 list-none items-center justify-between font-body text-micro font-medium tracking-control uppercase after:text-copy-lg after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
          Materials + care
        </summary>
        <ul className="mt-0 mb-prose-block pl-[1.2em]">
          {product.care.map((entry) => (
            <li className="text-label text-text-muted" key={entry.slice(0, 32)}>
              {entry}
            </li>
          ))}
        </ul>
      </details>
      <details className="group border-border-dark border-b">
        <summary className="flex min-h-13.5 list-none items-center justify-between font-body text-micro font-medium tracking-control uppercase after:text-copy-lg after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
          Repair
        </summary>
        <p className="text-label text-text-dark-muted">{product.repair}</p>
        <p>
          <Link
            className={textLink({ tone: "light" })}
            href="/pages/field-repair"
          >
            The repairs programme
          </Link>
        </p>
      </details>
    </div>
  );
}

/**
 * Product.
 *
 * The buy block is not composable — gallery, colorway and size selection,
 * price, availability, and the cart handoff own variant identity and URL query
 * state, so they stay theme-owned and render above whatever Weaverse composes.
 * `PRODUCT` therefore composes the surfaces *around* the buy block, and the
 * product itself reaches them through `dataContext` because the route, not a
 * merchant, decides which product this template is rendering.
 */
