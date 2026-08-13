"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { CartCount } from "@/components/cart-count";
import { Wordmark } from "@/components/wordmark";
import {
  createHeaderNavigationHref,
  createFieldIndexCollections,
  type FieldIndexCollection,
} from "@/lib/header-navigation";
import type { NavItem } from "@/lib/storefront/types";

export interface FieldIndexHeaderProps {
  announcement: string;
  primary: readonly NavItem[];
  queryString?: string;
  utility: readonly NavItem[];
}

interface FieldIndexPanelProps {
  activeIndex: number;
  collections: readonly FieldIndexCollection[];
  id: string;
  onClose: () => void;
  onSelect: (index: number) => void;
  pathname: string;
  queryString: string;
}

function isActive(pathname: string, href: string): boolean {
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    return true;
  }
  return href === "/shop" && pathname.startsWith("/products");
}

function accountNavigationLabel(item: NavItem, signedIn: boolean): string {
  return item.href === "/account" && signedIn ? "Signed in" : item.label;
}

function activeCollectionIndex(
  pathname: string,
  collections: readonly FieldIndexCollection[],
): number {
  const index = collections.findIndex((collection) =>
    isActive(pathname, collection.href),
  );
  return index >= 0 ? index : 0;
}

function FieldIndexPanel({
  activeIndex,
  collections,
  id,
  onClose,
  onSelect,
  pathname,
  queryString,
}: FieldIndexPanelProps) {
  const active = collections[activeIndex] ?? collections[0];
  if (active === undefined) {
    throw new Error("Header 01 requires at least one Shop collection.");
  }

  return (
    <section
      className="field-index-panel"
      id={id}
      aria-label="Shop field index"
    >
      <div className="field-index-kicker">
        <span>Shop / Field index</span>
        <span>{String(collections.length).padStart(2, "0")} systems</span>
      </div>
      <div className="field-index-grid">
        <nav className="field-index-list" aria-label="Shop collections">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              href={createHeaderNavigationHref(collection.href, queryString)}
              aria-current={
                isActive(pathname, collection.href) ? "page" : undefined
              }
              data-active={activeIndex === index ? "true" : undefined}
              onFocus={() => onSelect(index)}
              onMouseEnter={() => onSelect(index)}
              onClick={onClose}
            >
              <span className="field-index-number">{collection.index}</span>
              <span className="field-index-copy">
                <strong>{collection.label}</strong>
                <small>{collection.description}</small>
              </span>
              <span className="field-index-arrow" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </nav>
        <figure className="field-index-visual">
          <Image
            key={active.id}
            src={active.image.src}
            alt={active.image.alt}
            fill
            sizes="42vw"
          />
          <figcaption>
            <span>{active.coordinate}</span>
            <p className="field-index-note">{active.fieldNote}</p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

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
  return (
    <div className="field-mobile-index">
      <div className="field-mobile-section-label">
        <span>Shop / Field index</span>
        <span>{String(collections.length).padStart(2, "0")} systems</span>
      </div>
      <nav aria-label="Mobile shop collections">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={createHeaderNavigationHref(collection.href, queryString)}
            aria-current={
              isActive(pathname, collection.href) ? "page" : undefined
            }
            onClick={onNavigate}
          >
            <span>{collection.index}</span>
            <strong>{collection.label}</strong>
            <small>{collection.description}</small>
          </Link>
        ))}
      </nav>
      <p className="field-mobile-note">
        Designed for weather, miles, and repeat use.
      </p>
    </div>
  );
}

export function FieldIndexHeader({
  announcement,
  primary,
  queryString = "",
  utility,
}: FieldIndexHeaderProps) {
  const pathname = usePathname();
  const shopItem = primary.find((item) => item.href === "/shop");
  if (shopItem === undefined) {
    throw new Error("Header 01 requires a Shop navigation item.");
  }
  const collections = useMemo(
    () => createFieldIndexCollections(shopItem),
    [shopItem],
  );
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountSignedIn, setAccountSignedIn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    activeCollectionIndex(pathname, collections),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreMobileFocusRef = useRef(false);
  const mobileOpenRef = useRef(false);
  const mobilePanelRef = useRef<HTMLElement>(null);
  const desktopPanelId = useId();
  const mobilePanelId = useId();

  const searchItem = primary.find((item) => item.href === "/search");
  const primaryLinks = primary.filter(
    (item) => item.href !== "/shop" && item.href !== "/search",
  );
  const utilityLinks = utility.filter((item) => item.href !== "/cart");
  const mobileLinks = [
    ...primary.filter((item) => item.href !== "/shop"),
    ...utilityLinks,
  ];

  useEffect(() => {
    const controller = new AbortController();
    fetch("/account/status", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((status: unknown) => {
        if (
          typeof status === "object" &&
          status !== null &&
          "signedIn" in status &&
          typeof status.signedIn === "boolean"
        ) {
          setAccountSignedIn(status.signedIn);
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (mobileOpenRef.current) {
      restoreMobileFocusRef.current = true;
    }
    mobileOpenRef.current = false;
    setDesktopOpen(false);
    setMobileOpen(false);
    setActiveIndex(activeCollectionIndex(pathname, collections));
  }, [pathname, collections]);

  useEffect(() => {
    if (!desktopOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setDesktopOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDesktopOpen(false);
        desktopTriggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [desktopOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const panel = mobilePanelRef.current;
    if (panel === null) {
      return;
    }
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
    const backgroundElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".skip-link, .announcement, .field-header, #main-content, footer",
      ),
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
        restoreMobileFocusRef.current = true;
        mobileOpenRef.current = false;
        setMobileOpen(false);
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
    document.body.classList.add("locked");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("locked");
      for (const { element, inert } of previousInertStates) {
        element.inert = inert;
      }
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen || !restoreMobileFocusRef.current) {
      return;
    }
    restoreMobileFocusRef.current = false;
    mobileTriggerRef.current?.focus();
  }, [mobileOpen]);

  function toggleDesktop() {
    mobileOpenRef.current = false;
    setMobileOpen(false);
    setDesktopOpen((current) => !current);
  }

  function openMobile() {
    setDesktopOpen(false);
    mobileOpenRef.current = true;
    setMobileOpen(true);
  }

  function closeMobile() {
    restoreMobileFocusRef.current = true;
    mobileOpenRef.current = false;
    setMobileOpen(false);
  }

  return (
    <div ref={rootRef} className="field-header-root">
      <aside className="announcement" aria-label="Store announcement">
        <span>Forward field report / 01</span>
        <span>{announcement}</span>
        <span>54.4609° N / 3.0886° W</span>
      </aside>
      <header className="site-header field-header">
        <Wordmark href={createHeaderNavigationHref("/", queryString)} />
        <nav className="field-header-primary" aria-label="Primary navigation">
          <button
            ref={desktopTriggerRef}
            type="button"
            className={isActive(pathname, shopItem.href) ? "active" : undefined}
            aria-current={
              isActive(pathname, shopItem.href) ? "page" : undefined
            }
            aria-expanded={desktopOpen}
            aria-controls={desktopOpen ? desktopPanelId : undefined}
            onClick={toggleDesktop}
          >
            <i>01</i>
            {shopItem.label}
            <span className="field-header-toggle" aria-hidden="true">
              {desktopOpen ? "−" : "+"}
            </span>
          </button>
          {primaryLinks.map((item, index) => (
            <Link
              key={item.href}
              href={createHeaderNavigationHref(item.href, queryString)}
              className={isActive(pathname, item.href) ? "active" : undefined}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              onClick={() => setDesktopOpen(false)}
            >
              <i>{String(index + 2).padStart(2, "0")}</i>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions field-header-actions">
          {searchItem ? (
            <Link
              className="header-link field-header-search"
              href={createHeaderNavigationHref(searchItem.href, queryString)}
              aria-current={
                isActive(pathname, searchItem.href) ? "page" : undefined
              }
            >
              Search
            </Link>
          ) : null}
          {utilityLinks.map((item) => (
            <Link
              key={item.href}
              className="header-link account-hide"
              href={createHeaderNavigationHref(item.href, queryString)}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {accountNavigationLabel(item, accountSignedIn)}
            </Link>
          ))}
          <Link
            className="icon-button cart-button"
            href={createHeaderNavigationHref("/cart", queryString)}
            aria-current={isActive(pathname, "/cart") ? "page" : undefined}
          >
            <span className="cart-label">Cart</span>
            <CartCount />
          </Link>
          <button
            ref={mobileTriggerRef}
            type="button"
            className="icon-button menu-button field-header-menu-trigger"
            aria-expanded={mobileOpen}
            aria-controls={mobileOpen ? mobilePanelId : undefined}
            onClick={openMobile}
          >
            Menu
          </button>
        </div>
        {desktopOpen ? (
          <FieldIndexPanel
            activeIndex={activeIndex}
            collections={collections}
            id={desktopPanelId}
            onClose={() => setDesktopOpen(false)}
            onSelect={setActiveIndex}
            pathname={pathname}
            queryString={queryString}
          />
        ) : null}
      </header>
      {mobileOpen ? (
        <aside
          ref={mobilePanelRef}
          className="mobile-menu field-mobile-menu"
          id={mobilePanelId}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="mobile-menu-head field-mobile-head">
            <Wordmark
              href={createHeaderNavigationHref("/", queryString)}
              variant="mobile"
            />
            <button
              ref={closeButtonRef}
              type="button"
              className="icon-button"
              onClick={closeMobile}
              aria-label="Close menu"
            >
              Close
            </button>
          </div>
          <MobileFieldIndex
            collections={collections}
            onNavigate={closeMobile}
            pathname={pathname}
            queryString={queryString}
          />
          <nav
            className="field-mobile-secondary"
            aria-label="Mobile primary navigation"
          >
            {mobileLinks.map((item, index) => (
              <Link
                key={item.href}
                href={createHeaderNavigationHref(item.href, queryString)}
                aria-current={
                  isActive(pathname, item.href) ? "page" : undefined
                }
                onClick={closeMobile}
              >
                <span>{String(index + 4).padStart(2, "0")}</span>
                {accountNavigationLabel(item, accountSignedIn)}
                <i aria-hidden="true">↗</i>
              </Link>
            ))}
            <Link
              href={createHeaderNavigationHref("/cart", queryString)}
              aria-current={isActive(pathname, "/cart") ? "page" : undefined}
              onClick={closeMobile}
            >
              <span>{String(mobileLinks.length + 4).padStart(2, "0")}</span>
              Cart
              <CartCount />
            </Link>
          </nav>
          <p className="mobile-menu-meta">
            FOR / WARD · Field index
            <br />
            Shopify menu structure · Forward field system
          </p>
        </aside>
      ) : null}
    </div>
  );
}
