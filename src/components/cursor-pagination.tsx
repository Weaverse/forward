"use client";

import Link from "next/link";

import { pageHref } from "@/lib/storefront/filter-params";
import type { CollectionProductsPage } from "@/lib/storefront/types";

const link =
  "flex min-h-touch items-center justify-center border border-ink px-4.5 font-body text-micro font-bold tracking-label uppercase hover:bg-surface-subtle";

/**
 * Cursor paging, as links.
 *
 * There is no page number because there is no page count: a cursor names a
 * position in a result the store is streaming, not an index into a list the
 * theme holds. Claiming "page 3 of 7" would mean a second query for a total
 * nobody asked for.
 */
export function CursorPagination({
  pageInfo,
  pathname,
  params,
}: {
  pageInfo: CollectionProductsPage["pageInfo"];
  pathname: string;
  params: URLSearchParams;
}) {
  if (!pageInfo.hasPreviousPage && !pageInfo.hasNextPage) {
    return null;
  }
  return (
    <nav
      className="mt-14 flex items-center justify-center gap-2.5"
      aria-label="Pagination"
    >
      {pageInfo.hasPreviousPage && pageInfo.startCursor !== null ? (
        <Link
          className={link}
          href={pageHref(pathname, params, pageInfo.startCursor, "previous")}
          rel="prev"
        >
          Previous
        </Link>
      ) : null}
      {pageInfo.hasNextPage && pageInfo.endCursor !== null ? (
        <Link
          className={link}
          href={pageHref(pathname, params, pageInfo.endCursor, "next")}
          rel="next"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
