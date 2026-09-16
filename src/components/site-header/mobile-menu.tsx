"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { Icon } from "@/components/icon";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/lib/storefront/types";
import { CartCount } from "./cart-count";
import {
  accountNavigationLabel,
  createHeaderNavigationHref,
  currentCollectionIndex,
  type FieldIndexCollection,
  isActive,
} from "./header-navigation";
import { HEADER_CONTROL_CLASS } from "./header-styles";

interface MobileFieldIndexProps {
  collections: readonly FieldIndexCollection[];
  onNavigate: () => void;
  pathname: string;
  queryString: string;
}

function MobileFieldIndex({
  collections,
  onNavigate,
  pathname,
  queryString,
}: MobileFieldIndexProps) {
  const currentIndex = currentCollectionIndex(pathname, collections);
  return (
    <div>
      <div className="flex min-h-12 items-center justify-between border-white/22 border-b font-body text-micro text-text-dark-muted tracking-field-meta uppercase">
        <span>Shop / Field index</span>
        <span>{String(collections.length).padStart(2, "0")} systems</span>
      </div>
      <nav aria-label="Mobile shop collections">
        {collections.map((collection, index) => (
          <Link
            key={collection.id}
            href={createHeaderNavigationHref(collection.href, queryString)}
            className="grid min-h-24 grid-cols-[38px_1fr] content-center gap-x-3 gap-y-1.5 border-white/22 border-b xs:min-h-26"
            aria-current={currentIndex === index ? "page" : undefined}
            onClick={onNavigate}
          >
            <span className="row-span-2 font-body text-micro text-text-dark-muted">
              {collection.index}
            </span>
            <strong className="font-heading text-mobile-index-title font-title">
              {collection.label}
            </strong>
            <small className="text-field-meta text-text-dark-muted leading-mobile-index">
              {collection.description}
            </small>
          </Link>
        ))}
      </nav>
      <p className="mt-5.5 mb-0 font-body text-nano text-text-dark-muted tracking-label uppercase">
        Designed for weather, miles, and repeat use.
      </p>
    </div>
  );
}

interface MobileMenuProps {
  accountSignedIn: boolean;
  collections: readonly FieldIndexCollection[] | null;
  id: string;
  onClose: () => void;
  pathname: string;
  primary: readonly NavItem[];
  queryString: string;
  utilityLinks: readonly NavItem[];
}

/**
 * Mobile drawer. It mounts only while open, so the modal contract — inert
 * background, trapped Tab, locked scroll — lives and dies with the element
 * rather than being toggled around a permanently mounted panel.
 */
export function MobileMenu({
  accountSignedIn,
  collections,
  id,
  onClose,
  pathname,
  primary,
  queryString,
  utilityLinks,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLElement>(null);
  /* Escape reads the latest handler without re-arming the modal contract. */
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const links = [
    ...primary
      .filter((item) => item.href !== "/shop" || collections === null)
      .flatMap((item) => [
        { item, child: false },
        ...(item.children ?? []).map((child) => ({ item: child, child: true })),
      ]),
    ...utilityLinks.map((item) => ({ item, child: false })),
  ];

  useEffect(() => {
    const panel = panelRef.current;
    if (panel === null) {
      return;
    }
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
    const backgroundElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-shell-background]"),
    );
    const previousInertStates = backgroundElements.map((element) => ({
      element,
      inert: element.inert,
    }));
    for (const element of backgroundElements) {
      element.inert = true;
    }
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (first === undefined || last === undefined) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("overflow-hidden");
      for (const { element, inert } of previousInertStates) {
        element.inert = inert;
      }
    };
  }, []);

  return (
    <aside
      ref={panelRef}
      className="fixed inset-0 z-120 animate-shell-mobile overflow-auto bg-ink px-5 pb-10 text-text-inverse motion-reduce:animate-none md:px-page-gutter"
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <div className="sticky top-0 z-2 flex h-18 items-center justify-between gap-3.5 border-white/25 border-b bg-inherit">
        <Wordmark
          href={createHeaderNavigationHref("/", queryString)}
          variant="mobile"
        />
        <button
          ref={closeButtonRef}
          type="button"
          className={cn(HEADER_CONTROL_CLASS, "inline-flex")}
          onClick={onClose}
          aria-label="Close menu"
        >
          <Icon name="x" size={20} />
        </button>
      </div>
      {collections === null ? null : (
        <MobileFieldIndex
          collections={collections}
          onNavigate={onClose}
          pathname={pathname}
          queryString={queryString}
        />
      )}
      <nav
        className="mt-7.5 border-white/22 border-t"
        aria-label="Mobile primary navigation"
      >
        {links.map(({ item, child }, index) => (
          <Link
            key={`${child ? "child" : "item"}:${item.href}`}
            className={cn(
              "grid grid-cols-index-row items-center gap-2.5 border-white/18 border-b font-body uppercase",
              child
                ? "min-h-12 ps-8.5 text-ui text-text-dark-muted"
                : "min-h-15.5 text-copy-sm",
            )}
            href={createHeaderNavigationHref(item.href, queryString)}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            onClick={onClose}
          >
            <span className="font-body text-nano text-text-dark-muted">
              {String(index + 4).padStart(2, "0")}
            </span>
            {accountNavigationLabel(item, accountSignedIn)}
            <i
              className="font-body text-nano text-text-dark-muted not-italic"
              aria-hidden="true"
            >
              <Icon name="arrow-up-right" size={13} />
            </i>
          </Link>
        ))}
        <Link
          className="grid min-h-15.5 grid-cols-index-row items-center gap-2.5 border-white/18 border-b font-body text-copy-sm uppercase"
          href={createHeaderNavigationHref("/cart", queryString)}
          aria-current={isActive(pathname, "/cart") ? "page" : undefined}
          onClick={onClose}
        >
          <span className="font-body text-nano text-text-dark-muted">
            {String(links.length + 4).padStart(2, "0")}
          </span>
          Cart
          <CartCount />
        </Link>
      </nav>
      <p className="mt-11.25 mb-0 text-ui text-text-inverse-subtle leading-mobile-rail tracking-label uppercase">
        FOR / WARD · Field index
        <br />
        Shopify menu structure · Forward field system
      </p>
    </aside>
  );
}
