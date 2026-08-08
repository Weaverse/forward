"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { CartCount } from "@/components/cart-count";
import { Wordmark } from "@/components/wordmark";
import { FIELD_INDEX_COLLECTIONS } from "@/lib/header-navigation";
import type { NavItem } from "@/lib/storefront/types";

interface FieldIndexHeaderProps {
  announcement: string;
  primary: readonly NavItem[];
  utility: readonly NavItem[];
}

interface FieldIndexPanelProps {
  activeIndex: number;
  id: string;
  onClose: () => void;
  onSelect: (index: number) => void;
  pathname: string;
}

function isActive(pathname: string, href: string): boolean {
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    return true;
  }
  return href === "/shop" && pathname.startsWith("/products");
}

function activeCollectionIndex(pathname: string): number {
  const index = FIELD_INDEX_COLLECTIONS.findIndex((collection) =>
    isActive(pathname, collection.href),
  );
  return index >= 0 ? index : 0;
}

function FieldIndexPanel({
  activeIndex,
  id,
  onClose,
  onSelect,
  pathname,
}: FieldIndexPanelProps) {
  const active =
    FIELD_INDEX_COLLECTIONS[activeIndex] ?? FIELD_INDEX_COLLECTIONS[0];

  return (
    <section
      className="field-index-panel"
      id={id}
      aria-label="Shop field index"
    >
      <div className="field-index-kicker">
        <span>Shop / Field index</span>
        <span>03 systems</span>
      </div>
      <div className="field-index-grid">
        <nav className="field-index-list" aria-label="Shop collections">
          {FIELD_INDEX_COLLECTIONS.map((collection, index) => (
            <Link
              key={collection.id}
              href={collection.href}
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
  onNavigate: () => void;
  pathname: string;
}

function MobileFieldIndex({ onNavigate, pathname }: MobileFieldIndexProps) {
  return (
    <div className="field-mobile-index">
      <div className="field-mobile-section-label">
        <span>Shop / Field index</span>
        <span>03 systems</span>
      </div>
      <nav aria-label="Mobile shop collections">
        {FIELD_INDEX_COLLECTIONS.map((collection) => (
          <Link
            key={collection.id}
            href={collection.href}
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
  utility,
}: FieldIndexHeaderProps) {
  const pathname = usePathname();
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    activeCollectionIndex(pathname),
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

  const shopItem = primary.find((item) => item.href === "/shop") ?? {
    href: "/shop",
    label: "Shop",
  };
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
    if (mobileOpenRef.current) {
      restoreMobileFocusRef.current = true;
    }
    mobileOpenRef.current = false;
    setDesktopOpen(false);
    setMobileOpen(false);
    setActiveIndex(activeCollectionIndex(pathname));
  }, [pathname]);

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
        ".skip-link, .announcement, .field-header, .coordinate-spine, #main-content, footer",
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
        <Wordmark />
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
              href={item.href}
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
              href={searchItem.href}
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
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="icon-button cart-button"
            href="/cart"
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
            id={desktopPanelId}
            onClose={() => setDesktopOpen(false)}
            onSelect={setActiveIndex}
            pathname={pathname}
          />
        ) : null}
      </header>
      <aside className="coordinate-spine" aria-hidden="true">
        <span>N 54° 27′</span>
        <b>FORWARD</b>
        <span>W 3° 05′</span>
      </aside>

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
            <Wordmark variant="mobile" />
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
          <MobileFieldIndex onNavigate={closeMobile} pathname={pathname} />
          <nav
            className="field-mobile-secondary"
            aria-label="Mobile primary navigation"
          >
            {mobileLinks.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  isActive(pathname, item.href) ? "page" : undefined
                }
                onClick={closeMobile}
              >
                <span>{String(index + 4).padStart(2, "0")}</span>
                {item.label}
                <i aria-hidden="true">↗</i>
              </Link>
            ))}
            <Link
              href="/cart"
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
            Static navigation data · Shopify wiring deferred
          </p>
        </aside>
      ) : null}
    </div>
  );
}
