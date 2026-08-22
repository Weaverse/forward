"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { CartCount } from "@/components/cart-count";
import { CountryControl } from "@/components/country-control";
import { Icon, type IconName } from "@/components/icon";
import { MiniCart } from "@/components/mini-cart";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/cn";
import {
  createHeaderNavigationHref,
  createFieldIndexCollections,
  currentCollectionIndex,
  type FieldIndexCollection,
  isActive,
} from "@/lib/header-navigation";
import type { NavItem } from "@/lib/storefront/types";

/** Utility destinations Shopify owns; Forward only supplies their glyphs. */
const UTILITY_ICONS: Readonly<Record<string, IconName>> = {
  "/account": "user",
};

const PRIMARY_NAV_ITEM_CLASS =
  "group inline-flex min-w-[122px] items-center justify-center gap-2.5 border-0 border-s border-border-subtle px-5 font-body text-[12px] font-ui-strong tracking-[0.06em] uppercase hover:bg-ink hover:text-text-inverse aria-[current=page]:bg-ink aria-[current=page]:text-text-inverse last:border-e max-xl:min-w-[102px] max-xl:px-3.5";
const HEADER_CONTROL_CLASS =
  "min-h-touch min-w-touch items-center justify-center gap-2 bg-transparent font-body text-[12px] font-ui tracking-[0.06em] uppercase hover:bg-surface-subtle";

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

interface AboutIndexPanelProps {
  item: NavItem;
  id: string;
  onClose: () => void;
  pathname: string;
  queryString: string;
}

function isBranchActive(pathname: string, item: NavItem): boolean {
  return (
    isActive(pathname, item.href) ||
    item.children?.some((child) => isActive(pathname, child.href)) === true
  );
}

function accountNavigationLabel(item: NavItem, signedIn: boolean): string {
  return item.href === "/account" && signedIn ? "Signed in" : item.label;
}

function activeCollectionIndex(
  pathname: string,
  collections: readonly FieldIndexCollection[],
): number {
  return Math.max(currentCollectionIndex(pathname, collections), 0);
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
  const currentIndex = currentCollectionIndex(pathname, collections);

  return (
    <section
      className="absolute inset-x-0 top-full z-[-1] animate-[shell-panel-enter_var(--duration-panel)_var(--ease-enter)_both] border-ink border-b bg-canvas shadow-panel motion-reduce:animate-none max-lg:hidden"
      id={id}
      aria-label="Shop field index"
    >
      <div className="flex min-h-[42px] items-center justify-between border-border-subtle border-b px-page-gutter font-body text-[9px] text-text-muted tracking-field-meta uppercase">
        <span>Shop / Field index</span>
        <span>{String(collections.length).padStart(2, "0")} systems</span>
      </div>
      <div className="grid min-h-[368px] grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
        <nav
          className="grid grid-rows-[repeat(3,1fr)]"
          aria-label="Shop collections"
        >
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              href={createHeaderNavigationHref(collection.href, queryString)}
              className="group grid grid-cols-[52px_minmax(0,1fr)_40px] items-center gap-[18px] border-border-subtle border-b px-page-gutter py-5 [transition:background-color_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),padding-inline_220ms_var(--ease-standard)] last:border-b-0 hover:bg-ink hover:ps-[calc(var(--spacing-page-gutter)+10px)] hover:text-text-inverse focus-visible:bg-ink focus-visible:ps-[calc(var(--spacing-page-gutter)+10px)] focus-visible:text-text-inverse data-[active=true]:bg-ink data-[active=true]:ps-[calc(var(--spacing-page-gutter)+10px)] data-[active=true]:text-text-inverse motion-reduce:transition-none"
              aria-current={currentIndex === index ? "page" : undefined}
              data-active={activeIndex === index ? "true" : undefined}
              onFocus={() => onSelect(index)}
              onMouseEnter={() => onSelect(index)}
              onClick={onClose}
            >
              <span className="font-body text-[10px]">{collection.index}</span>
              <span className="grid grid-cols-[minmax(180px,0.55fr)_minmax(220px,1fr)] items-baseline gap-[26px] max-xl:grid-cols-1 max-xl:gap-[5px]">
                <strong className="font-heading text-[clamp(25px,2.5vw,40px)] [font-weight:var(--font-weight-heading)] tracking-heading">
                  {collection.label}
                </strong>
                <small className="max-w-[340px] text-[11px] text-text-muted leading-[1.65] group-hover:text-text-dark-muted group-data-[active=true]:text-text-dark-muted">
                  {collection.description}
                </small>
              </span>
              <span className="font-body text-[15px]" aria-hidden="true">
                <Icon name="arrow-up-right" size={16} />
              </span>
            </Link>
          ))}
        </nav>
        <figure className="relative min-h-[368px] overflow-hidden bg-ink after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent_48%,rgba(5,16,11,0.74))] after:content-['']">
          <Image
            key={active.id}
            src={active.image.src}
            alt={active.image.alt}
            fill
            className="animate-[shell-image-enter_var(--duration-media)_var(--ease-standard)_both] object-cover motion-reduce:animate-none"
            sizes="42vw"
          />
          <figcaption className="absolute right-7 bottom-6 left-7 z-[1] flex items-end justify-between gap-6 text-text-inverse">
            <span className="font-body text-[9px] tracking-[0.1em]">
              {active.coordinate}
            </span>
            <p className="m-0 max-w-[260px] text-right font-heading text-[19px] leading-[1.2]">
              {active.fieldNote}
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function AboutIndexPanel({
  item,
  id,
  onClose,
  pathname,
  queryString,
}: AboutIndexPanelProps) {
  return (
    <section
      className="absolute inset-x-0 top-full z-[-1] animate-[shell-panel-enter_var(--duration-panel)_var(--ease-enter)_both] border-ink border-b bg-canvas shadow-panel motion-reduce:animate-none max-lg:hidden"
      id={id}
      aria-label="About Forward pages"
    >
      <div className="flex min-h-[42px] items-center justify-between border-border-subtle border-b px-page-gutter font-body text-[9px] text-text-muted tracking-field-meta uppercase">
        <span>About / Field manual</span>
        <span className="inline-flex gap-[18px]">
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
            className="grid min-h-[132px] grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-4 border-border-subtle border-r border-b px-page-gutter py-6 [transition:background-color_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),padding-inline_220ms_var(--ease-standard)] hover:bg-ink hover:ps-[calc(var(--spacing-page-gutter)+10px)] hover:text-text-inverse focus-visible:bg-ink focus-visible:ps-[calc(var(--spacing-page-gutter)+10px)] focus-visible:text-text-inverse aria-[current=page]:bg-ink aria-[current=page]:ps-[calc(var(--spacing-page-gutter)+10px)] aria-[current=page]:text-text-inverse [&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+3)]:border-b-0"
            aria-current={isActive(pathname, child.href) ? "page" : undefined}
            onClick={onClose}
          >
            <span className="font-body text-[9px] text-text-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <strong className="font-heading text-[clamp(22px,2vw,32px)] [font-weight:var(--font-weight-heading)] tracking-[-0.03em]">
              {child.label}
            </strong>
            <i
              className="font-body text-[9px] text-text-muted not-italic"
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
      <div className="flex min-h-12 items-center justify-between border-white/22 border-b font-body text-[9px] text-text-dark-muted tracking-field-meta uppercase">
        <span>Shop / Field index</span>
        <span>{String(collections.length).padStart(2, "0")} systems</span>
      </div>
      <nav aria-label="Mobile shop collections">
        {collections.map((collection, index) => (
          <Link
            key={collection.id}
            href={createHeaderNavigationHref(collection.href, queryString)}
            className="grid min-h-[104px] grid-cols-[38px_1fr] content-center gap-x-3 gap-y-1.5 border-white/22 border-b max-xs:min-h-24"
            aria-current={currentIndex === index ? "page" : undefined}
            onClick={onNavigate}
          >
            <span className="row-span-2 font-body text-[9px] text-text-dark-muted">
              {collection.index}
            </span>
            <strong className="font-heading text-[clamp(25px,8vw,36px)] [font-weight:var(--font-weight-heading)]">
              {collection.label}
            </strong>
            <small className="text-[10px] text-text-dark-muted leading-[1.5]">
              {collection.description}
            </small>
          </Link>
        ))}
      </nav>
      <p className="mt-[22px] mb-0 font-body text-[8px] text-text-dark-muted tracking-[0.1em] uppercase">
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
  const aboutItem = primary.find(
    (item) => item.href === "/pages/about-forward",
  );
  if (aboutItem?.children === undefined || aboutItem.children.length === 0) {
    throw new Error(
      "Header 01 requires the canonical About navigation branch.",
    );
  }
  const collections = useMemo(
    () => createFieldIndexCollections(shopItem),
    [shopItem],
  );
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountSignedIn, setAccountSignedIn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    activeCollectionIndex(pathname, collections),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const aboutTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreMobileFocusRef = useRef(false);
  const mobileOpenRef = useRef(false);
  const mobilePanelRef = useRef<HTMLElement>(null);
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
  const mobileLinks = [
    ...primary
      .filter((item) => item.href !== "/shop")
      .flatMap((item) => [
        { item, child: false },
        ...(item.children ?? []).map((child) => ({ item: child, child: true })),
      ]),
    ...utilityLinks.map((item) => ({ item, child: false })),
  ];

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
    setActiveIndex(activeCollectionIndex(pathname, collections));
  }, [pathname, collections]);

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
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("overflow-hidden");
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
        className="flex min-h-announcement items-center justify-between bg-signal px-page-gutter py-1.5 text-center font-body text-[9px] font-ui text-ink tracking-[0.13em] uppercase max-md:justify-center"
        data-shell-background
        aria-label="Store announcement"
      >
        <span className="max-md:hidden">Forward field report / 01</span>
        <span>{announcement}</span>
        <CountryControl />
      </aside>
      <header
        className="sticky top-0 z-[80] isolate grid h-header grid-cols-[minmax(155px,1fr)_auto_minmax(230px,1fr)] items-center border-ink border-b bg-canvas/96 px-page-gutter max-lg:grid-cols-[1fr_auto] max-md:h-header-compact"
        data-shell-background
      >
        <Wordmark href={createHeaderNavigationHref("/", queryString)} />
        <nav
          className="flex self-stretch justify-center max-lg:hidden"
          aria-label="Primary navigation"
        >
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
            <i className="text-[11px] text-text-muted not-italic group-hover:text-text-dark-muted group-aria-[current=page]:text-text-dark-muted">
              01
            </i>
            {shopItem.label}
            <span
              className="inline-flex min-w-[10px] items-center text-[13px] text-signal-strong"
              aria-hidden="true"
            >
              <Icon name={desktopOpen ? "caret-up" : "caret-down"} size={12} />
            </span>
          </button>
          {primaryLinks.map((item, index) =>
            item.href === aboutItem.href ? (
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
                <i className="text-[11px] text-text-muted not-italic group-hover:text-text-dark-muted group-aria-[current=page]:text-text-dark-muted">
                  {String(index + 2).padStart(2, "0")}
                </i>
                {item.label}
                <span
                  className="inline-flex min-w-[10px] items-center text-[13px] text-signal-strong"
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
                <i className="text-[11px] text-text-muted not-italic group-hover:text-text-dark-muted group-aria-[current=page]:text-text-dark-muted">
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
                "inline-flex max-xl:hidden max-lg:inline-flex max-md:hidden",
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
                  "inline-flex max-lg:hidden",
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
            className={cn(
              HEADER_CONTROL_CLASS,
              "inline-flex px-3 max-sm:px-1.5",
            )}
            href={createHeaderNavigationHref("/cart", queryString)}
            aria-current={isActive(pathname, "/cart") ? "page" : undefined}
          >
            <Icon name="shopping-bag" />
            <span className="max-md:sr-only">Cart</span>
            <CartCount />
          </Link>
          <button
            ref={mobileTriggerRef}
            type="button"
            className={cn(
              HEADER_CONTROL_CLASS,
              "hidden px-2 max-lg:inline-flex",
            )}
            aria-expanded={mobileOpen}
            aria-controls={mobileOpen ? mobilePanelId : undefined}
            onClick={openMobile}
          >
            <Icon name="list" />
            <span className="max-md:sr-only">Menu</span>
          </button>
          <MiniCart />
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
        {aboutOpen ? (
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
        <aside
          ref={mobilePanelRef}
          className="fixed inset-0 z-[120] animate-[shell-mobile-enter_260ms_var(--ease-enter)_both] overflow-auto bg-ink px-page-gutter pb-10 text-text-inverse motion-reduce:animate-none max-md:px-5"
          id={mobilePanelId}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="sticky top-0 z-[2] flex h-[72px] items-center justify-between gap-3.5 border-white/25 border-b bg-inherit">
            <Wordmark
              href={createHeaderNavigationHref("/", queryString)}
              variant="mobile"
            />
            <button
              ref={closeButtonRef}
              type="button"
              className={cn(HEADER_CONTROL_CLASS, "inline-flex")}
              onClick={closeMobile}
              aria-label="Close menu"
            >
              <Icon name="x" size={20} />
            </button>
          </div>
          <MobileFieldIndex
            collections={collections}
            onNavigate={closeMobile}
            pathname={pathname}
            queryString={queryString}
          />
          <nav
            className="mt-[30px] border-white/22 border-t"
            aria-label="Mobile primary navigation"
          >
            {mobileLinks.map(({ item, child }, index) => (
              <Link
                key={item.href}
                className={cn(
                  "grid grid-cols-[34px_1fr_auto] items-center gap-2.5 border-white/18 border-b font-body uppercase",
                  child
                    ? "min-h-12 ps-[34px] text-[11px] text-text-dark-muted"
                    : "min-h-[62px] text-[14px]",
                )}
                href={createHeaderNavigationHref(item.href, queryString)}
                aria-current={
                  isActive(pathname, item.href) ? "page" : undefined
                }
                onClick={closeMobile}
              >
                <span className="font-body text-[8px] text-text-dark-muted">
                  {String(index + 4).padStart(2, "0")}
                </span>
                {accountNavigationLabel(item, accountSignedIn)}
                <i
                  className="font-body text-[8px] text-text-dark-muted not-italic"
                  aria-hidden="true"
                >
                  <Icon name="arrow-up-right" size={13} />
                </i>
              </Link>
            ))}
            <Link
              className="grid min-h-[62px] grid-cols-[34px_1fr_auto] items-center gap-2.5 border-white/18 border-b font-body text-[14px] uppercase"
              href={createHeaderNavigationHref("/cart", queryString)}
              aria-current={isActive(pathname, "/cart") ? "page" : undefined}
              onClick={closeMobile}
            >
              <span className="font-body text-[8px] text-text-dark-muted">
                {String(mobileLinks.length + 4).padStart(2, "0")}
              </span>
              Cart
              <CartCount />
            </Link>
          </nav>
          <p className="mt-[45px] mb-0 text-[11px] text-text-inverse-subtle leading-[1.8] tracking-[0.1em] uppercase">
            FOR / WARD · Field index
            <br />
            Shopify menu structure · Forward field system
          </p>
        </aside>
      ) : null}
    </div>
  );
}
