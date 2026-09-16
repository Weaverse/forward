"use client";

import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import {
  createHeaderNavigationHref,
  currentCollectionIndex,
  type FieldIndexCollection,
} from "./header-navigation";
import { INDEX_ROW_TRANSITION } from "./header-styles";

interface FieldIndexPanelProps {
  activeIndex: number;
  collections: readonly FieldIndexCollection[];
  id: string;
  onClose: () => void;
  onSelect: (index: number) => void;
  pathname: string;
  queryString: string;
}

/** Desktop Shop mega panel: the collection index beside its hero plate. */
export function FieldIndexPanel({
  activeIndex,
  collections,
  id,
  onClose,
  onSelect,
  pathname,
  queryString,
}: FieldIndexPanelProps) {
  const active = collections[activeIndex] ?? collections[0];
  /* The panel is an enhancement on merchant-owned navigation: with nothing to
   * show it degrades to no panel instead of taking down the root layout. */
  if (active === undefined) {
    return null;
  }
  const currentIndex = currentCollectionIndex(pathname, collections);

  return (
    <section
      className="absolute inset-x-0 top-full -z-1 hidden animate-shell-panel border-ink border-b bg-canvas text-ink shadow-panel motion-reduce:animate-none lg:block"
      id={id}
      aria-label="Shop field index"
    >
      <div className="flex min-h-10.5 items-center justify-between border-border-subtle border-b px-page-gutter font-body text-micro text-text-muted tracking-field-meta uppercase">
        <span>Shop / Field index</span>
        <span>{String(collections.length).padStart(2, "0")} systems</span>
      </div>
      <div className="grid min-h-92 grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
        <nav
          className="grid grid-rows-[repeat(3,1fr)]"
          aria-label="Shop collections"
        >
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              href={createHeaderNavigationHref(collection.href, queryString)}
              className={cn(
                "group grid grid-cols-[52px_minmax(0,1fr)_40px] items-center gap-4.5 border-border-subtle border-b px-page-gutter py-5",
                INDEX_ROW_TRANSITION,
                "last:border-b-0 hover:bg-ink hover:ps-field-index-indent hover:text-text-inverse focus-visible:bg-ink focus-visible:ps-field-index-indent focus-visible:text-text-inverse data-[active=true]:bg-ink data-[active=true]:ps-field-index-indent data-[active=true]:text-text-inverse motion-reduce:transition-none",
              )}
              aria-current={currentIndex === index ? "page" : undefined}
              data-active={activeIndex === index ? "true" : undefined}
              onFocus={() => onSelect(index)}
              onMouseEnter={() => onSelect(index)}
              onClick={onClose}
            >
              <span className="font-body text-field-meta">
                {collection.index}
              </span>
              <span className="grid grid-cols-1 items-baseline gap-1.25 xl:grid-cols-[minmax(180px,0.55fr)_minmax(220px,1fr)] xl:gap-6.5">
                <strong className="font-heading text-field-index-title font-title tracking-heading">
                  {collection.label}
                </strong>
                <small className="max-w-85 text-ui text-text-muted leading-field-index-copy group-hover:text-text-dark-muted group-data-[active=true]:text-text-dark-muted">
                  {collection.description}
                </small>
              </span>
              <span className="font-body text-copy" aria-hidden="true">
                <Icon name="arrow-up-right" size={16} />
              </span>
            </Link>
          ))}
        </nav>
        <figure className="relative min-h-92 overflow-hidden bg-ink after:absolute after:inset-0 after:bg-field-index-overlay after:content-['']">
          <Image
            key={active.id}
            src={active.image.src}
            alt={active.image.alt}
            fill
            className="animate-shell-image object-cover motion-reduce:animate-none"
            sizes="42vw"
          />
          <figcaption className="absolute right-7 bottom-6 left-7 z-1 flex items-end justify-between gap-6 text-text-inverse">
            <span className="font-body text-micro tracking-label">
              {active.coordinate}
            </span>
            <p className="m-0 max-w-65 text-right font-heading text-card-title leading-copy">
              {active.fieldNote}
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
