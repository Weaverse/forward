"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { Icon, type IconName } from "@/components/icon";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/lib/storefront/types";
import { AboutIndexPanel } from "./about-index-panel";
import { CartCount } from "./cart-count";
import { CountryControl } from "./country-control";
import { FieldIndexPanel } from "./field-index-panel";
import {
  accountNavigationLabel,
  activeCollectionIndex,
  createHeaderNavigationHref,
  fieldIndexCollections,
  isActive,
  isBranchActive,
} from "./header-navigation";
import { HEADER_CONTROL_CLASS, PRIMARY_NAV_ITEM_CLASS } from "./header-styles";
import { MiniCart } from "./mini-cart";
import { MobileMenu } from "./mobile-menu";

/** Utility destinations Shopify owns; Forward only supplies their glyphs. */
const UTILITY_ICONS: Readonly<Record<string, IconName>> = {
  "/account": "user",
};

export interface FieldIndexHeaderProps {
  announcement: string;
  primary: readonly NavItem[];
  queryString?: string;
  utility: readonly NavItem[];
}

export function FieldIndexHeader({
  announcement,
  primary,
  queryString = "",
  utility,
}: FieldIndexHeaderProps) {
  const pathname = usePathname();
  const shopItem = primary.find((item) => item.href === "/shop");
  const aboutItem = primary.find(
    (item) => item.href === "/pages/about-forward",
  );
  const collections = fieldIndexCollections(shopItem);
  const aboutHasPanel = (aboutItem?.children?.length ?? 0) > 0;
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountSignedIn, setAccountSignedIn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    activeCollectionIndex(pathname, collections ?? []),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const aboutTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const restoreMobileFocusRef = useRef(false);
  const mobileOpenRef = useRef(false);
  const desktopPanelId = useId();
  const aboutPanelId = useId();
  const mobilePanelId = useId();

  const searchItem = primary.find((item) => item.href === "/search");
  const primaryLinks = primary.filter(
    (item) => item.href !== "/shop" && item.href !== "/search",
  );
  const utilityLinks = utility.filter((item) => item.href !== "/cart");
  const accountAvailable = utilityLinks.some(
    (item) => item.href === "/account",
  );

  useEffect(() => {
    if (!accountAvailable) {
      setAccountSignedIn(false);
      return;
    }
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
  }, [accountAvailable]);

  useEffect(() => {
    if (mobileOpenRef.current) {
      restoreMobileFocusRef.current = true;
    }
    mobileOpenRef.current = false;
    setDesktopOpen(false);
    setAboutOpen(false);
    setMobileOpen(false);
    setActiveIndex(
      activeCollectionIndex(pathname, fieldIndexCollections(shopItem) ?? []),
    );
  }, [pathname, shopItem]);

  useEffect(() => {
    if (!desktopOpen && !aboutOpen) {
      return;
    }

    function closeDesktopPanels() {
      setDesktopOpen(false);
      setAboutOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        closeDesktopPanels();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDesktopPanels();
        if (aboutOpen) {
          aboutTriggerRef.current?.focus();
        } else {
          desktopTriggerRef.current?.focus();
        }
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [aboutOpen, desktopOpen]);

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
    setAboutOpen(false);
    setDesktopOpen((current) => !current);
  }

  function toggleAbout() {
    mobileOpenRef.current = false;
    setMobileOpen(false);
    setDesktopOpen(false);
    setAboutOpen((current) => !current);
  }

  function openMobile() {
    setDesktopOpen(false);
    setAboutOpen(false);
    mobileOpenRef.current = true;
    setMobileOpen(true);
  }

  function closeMobile() {
    restoreMobileFocusRef.current = true;
    mobileOpenRef.current = false;
    setMobileOpen(false);
  }

  return (
    <div ref={rootRef} className="contents">
      <aside
        className="flex min-h-announcement items-center justify-center bg-signal px-page-gutter py-1.5 text-center font-body text-micro font-ui text-ink tracking-announcement uppercase md:justify-between"
        data-shell-background
        aria-label="Store announcement"
      >
        <span className="hidden md:inline">Forward field report / 01</span>
        <span>{announcement}</span>
        <CountryControl />
      </aside>
      <header
        className="sticky top-0 z-80 isolate grid h-header-compact grid-cols-lead-trailing items-center border-ink border-b bg-canvas/96 px-page-gutter md:h-header lg:grid-cols-[minmax(155px,1fr)_auto_minmax(230px,1fr)]"
        data-shell-background
      >
        <Wordmark href={createHeaderNavigationHref("/", queryString)} />
        <nav
          className="hidden self-stretch justify-center lg:flex"
          aria-label="Primary navigation"
        >
          {shopItem === undefined ? null : collections === null ? (
            <Link
              href={createHeaderNavigationHref(shopItem.href, queryString)}
              className={PRIMARY_NAV_ITEM_CLASS}
              aria-current={
                isActive(pathname, shopItem.href) ? "page" : undefined
              }
            >
              <i className="text-ui text-text-muted not-italic group-hover:text-text-dark-muted group-aria-[current=page]:text-text-dark-muted">
                01
              </i>
              {shopItem.label}
            </Link>
          ) : (
            <button
              ref={desktopTriggerRef}
              type="button"
              className={PRIMARY_NAV_ITEM_CLASS}
              aria-current={
                isActive(pathname, shopItem.href) ? "page" : undefined
              }
              aria-expanded={desktopOpen}
              aria-controls={desktopOpen ? desktopPanelId : undefined}
              onClick={toggleDesktop}
            >
              <i className="text-ui text-text-muted not-italic group-hover:text-text-dark-muted group-aria-[current=page]:text-text-dark-muted">
                01
              </i>
              {shopItem.label}
              <span
                className="inline-flex min-w-2.5 items-center text-label text-signal-strong"
                aria-hidden="true"
              >
                <Icon
                  name={desktopOpen ? "caret-up" : "caret-down"}
                  size={12}
                />
              </span>
            </button>
          )}
          {primaryLinks.map((item, index) =>
            item === aboutItem && aboutHasPanel ? (
              <button
                key={item.href}
                ref={aboutTriggerRef}
                type="button"
                className={PRIMARY_NAV_ITEM_CLASS}
                aria-current={
                  isBranchActive(pathname, item) ? "page" : undefined
                }
                aria-expanded={aboutOpen}
                aria-controls={aboutOpen ? aboutPanelId : undefined}
                onClick={toggleAbout}
              >
                <i className="text-ui text-text-muted not-italic group-hover:text-text-dark-muted group-aria-[current=page]:text-text-dark-muted">
                  {String(index + 2).padStart(2, "0")}
                </i>
                {item.label}
                <span
                  className="inline-flex min-w-2.5 items-center text-label text-signal-strong"
                  aria-hidden="true"
                >
                  <Icon
                    name={aboutOpen ? "caret-up" : "caret-down"}
                    size={12}
                  />
                </span>
              </button>
            ) : (
              <Link
                key={item.href}
                href={createHeaderNavigationHref(item.href, queryString)}
                className={PRIMARY_NAV_ITEM_CLASS}
                aria-current={
                  isActive(pathname, item.href) ? "page" : undefined
                }
                onClick={() => {
                  setDesktopOpen(false);
                  setAboutOpen(false);
                }}
              >
                <i className="text-ui text-text-muted not-italic group-hover:text-text-dark-muted group-aria-[current=page]:text-text-dark-muted">
                  {String(index + 2).padStart(2, "0")}
                </i>
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="relative flex items-center justify-self-end gap-3">
          {searchItem ? (
            <Link
              className={cn(
                HEADER_CONTROL_CLASS,
                "hidden md:inline-flex lg:hidden xl:inline-flex",
              )}
              href={createHeaderNavigationHref(searchItem.href, queryString)}
              aria-current={
                isActive(pathname, searchItem.href) ? "page" : undefined
              }
            >
              <Icon name="magnifying-glass" />
              <span>Search</span>
            </Link>
          ) : null}
          {utilityLinks.map((item) => {
            const icon = UTILITY_ICONS[item.href];
            return (
              <Link
                key={item.href}
                className={cn(
                  HEADER_CONTROL_CLASS,
                  "hidden lg:inline-flex px-1.5 sm:px-3",
                )}
                href={createHeaderNavigationHref(item.href, queryString)}
                aria-current={
                  isActive(pathname, item.href) ? "page" : undefined
                }
              >
                {icon === undefined ? null : <Icon name={icon} />}
                <span>{accountNavigationLabel(item, accountSignedIn)}</span>
              </Link>
            );
          })}
          <Link
            className={cn(HEADER_CONTROL_CLASS, "inline-flex px-1.5 sm:px-3")}
            href={createHeaderNavigationHref("/cart", queryString)}
            aria-current={isActive(pathname, "/cart") ? "page" : undefined}
          >
            <Icon name="shopping-bag" />
            <span className="sr-only md:not-sr-only">Cart</span>
            <CartCount />
          </Link>
          <button
            ref={mobileTriggerRef}
            type="button"
            className={cn(HEADER_CONTROL_CLASS, "inline-flex px-2 lg:hidden")}
            aria-expanded={mobileOpen}
            aria-controls={mobileOpen ? mobilePanelId : undefined}
            onClick={openMobile}
          >
            <Icon name="list" />
            <span className="sr-only md:not-sr-only">Menu</span>
          </button>
          <MiniCart />
        </div>
        {desktopOpen && collections !== null ? (
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
        {aboutOpen && aboutItem !== undefined && aboutHasPanel ? (
          <AboutIndexPanel
            item={aboutItem}
            id={aboutPanelId}
            onClose={() => setAboutOpen(false)}
            pathname={pathname}
            queryString={queryString}
          />
        ) : null}
      </header>
      {mobileOpen ? (
        <MobileMenu
          accountSignedIn={accountSignedIn}
          collections={collections}
          id={mobilePanelId}
          onClose={closeMobile}
          pathname={pathname}
          primary={primary}
          queryString={queryString}
          utilityLinks={utilityLinks}
        />
      ) : null}
    </div>
  );
}
