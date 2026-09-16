"use client";

import Link from "next/link";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/lib/storefront/types";
import { createHeaderNavigationHref, isActive } from "./header-navigation";
import { INDEX_ROW_TRANSITION } from "./header-styles";

interface AboutIndexPanelProps {
  item: NavItem;
  id: string;
  onClose: () => void;
  pathname: string;
  queryString: string;
}

/** Desktop About mega panel: the field manual's pages as a numbered grid. */
export function AboutIndexPanel({
  item,
  id,
  onClose,
  pathname,
  queryString,
}: AboutIndexPanelProps) {
  return (
    <section
      className="absolute inset-x-0 top-full -z-1 hidden animate-shell-panel border-ink border-b bg-canvas shadow-panel motion-reduce:animate-none lg:block"
      id={id}
      aria-label="About Forward pages"
    >
      <div className="flex min-h-10.5 items-center justify-between border-border-subtle border-b px-page-gutter font-body text-micro text-text-muted tracking-field-meta uppercase">
        <span>About / Field manual</span>
        <span className="inline-flex gap-4.5">
          <Link
            href={createHeaderNavigationHref(item.href, queryString)}
            className="text-ink"
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            onClick={onClose}
          >
            Overview <Icon name="arrow-up-right" size={13} />
          </Link>
          {String(item.children?.length ?? 0).padStart(2, "0")} pages
        </span>
      </div>
      <nav
        className="col-span-full grid grid-cols-3"
        aria-label="About Forward"
      >
        {item.children?.map((child, index) => (
          <Link
            key={child.href}
            href={createHeaderNavigationHref(child.href, queryString)}
            className={cn(
              "grid min-h-33 grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-4 border-border-subtle border-r border-b px-page-gutter py-6",
              INDEX_ROW_TRANSITION,
              "hover:bg-ink hover:ps-field-index-indent hover:text-text-inverse focus-visible:bg-ink focus-visible:ps-field-index-indent focus-visible:text-text-inverse aria-[current=page]:bg-ink aria-[current=page]:ps-field-index-indent aria-[current=page]:text-text-inverse [&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+3)]:border-b-0",
            )}
            aria-current={isActive(pathname, child.href) ? "page" : undefined}
            onClick={onClose}
          >
            <span className="font-body text-micro text-text-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <strong className="font-heading text-about-index-title font-title tracking-about-index-title">
              {child.label}
            </strong>
            <i
              className="font-body text-micro text-text-muted not-italic"
              aria-hidden="true"
            >
              <Icon name="arrow-up-right" size={13} />
            </i>
          </Link>
        ))}
      </nav>
    </section>
  );
}
